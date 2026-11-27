import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/push/notify — send a "new guide" push to every subscriber.
 *
 * Self-hosted Web Push with no extra packages: VAPID (ES256 JWT) and
 * the RFC 8291 aes128gcm payload encryption are implemented here with
 * node:crypto only (ECDH on P-256, HKDF-SHA256, AES-128-GCM).
 *
 * Protected by the PUSH_ADMIN_SECRET env var (header x-push-secret).
 * Reads subscriptions with the Supabase secret key (SUPABASE_SECRET_KEY
 * env var, server-side only — never committed, never sent to browsers).
 * Subscriptions that answer 404/410 are gone for good and are deleted.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function b64urlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function b64urlEncode(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function uncompressedPoint(x: Buffer, y: Buffer): Buffer {
  return Buffer.concat([Buffer.from([0x04]), x, y]);
}

/** VAPID Authorization header for one push endpoint (RFC 8292). */
function vapidAuthorization(endpoint: string): string {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const privateRaw = process.env.VAPID_PRIVATE_KEY ?? "";
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@everydaynaira.com";
  const publicPoint = b64urlDecode(publicKey);
  const key = crypto.createPrivateKey({
    format: "jwk",
    key: {
      kty: "EC",
      crv: "P-256",
      x: b64urlEncode(publicPoint.subarray(1, 33)),
      y: b64urlEncode(publicPoint.subarray(33, 65)),
      d: b64urlEncode(b64urlDecode(privateRaw)),
    },
  });
  const header = b64urlEncode(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64urlEncode(
    Buffer.from(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: subject,
      }),
    ),
  );
  const signingInput = `${header}.${claims}`;
  const signer = crypto.createSign("SHA256");
  signer.update(signingInput);
  const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" });
  return `vapid t=${signingInput}.${b64urlEncode(signature)}, k=${publicKey}`;
}

/** Encrypt one payload for one subscription (RFC 8291, aes128gcm). */
function encryptPayload(payload: string, p256dh: string, auth: string): Buffer {
  const uaPublic = b64urlDecode(p256dh);
  const authSecret = b64urlDecode(auth);

  // Ephemeral sender key pair on P-256.
  const ephemeral = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
  const ephemeralJwk = ephemeral.publicKey.export({ format: "jwk" }) as JsonWebKey;
  const asPublic = uncompressedPoint(
    b64urlDecode(ephemeralJwk.x ?? ""),
    b64urlDecode(ephemeralJwk.y ?? ""),
  );

  const uaKey = crypto.createPublicKey({
    format: "jwk",
    key: {
      kty: "EC",
      crv: "P-256",
      x: b64urlEncode(uaPublic.subarray(1, 33)),
      y: b64urlEncode(uaPublic.subarray(33, 65)),
    },
  });
  const sharedSecret = crypto.diffieHellman({
    privateKey: ephemeral.privateKey,
    publicKey: uaKey,
  });

  // Key derivation exactly as RFC 8291 section 3.4 / RFC 8188.
  const ikm = Buffer.from(
    crypto.hkdfSync(
      "sha256",
      sharedSecret,
      authSecret,
      Buffer.concat([Buffer.from("WebPush: info\0", "utf8"), uaPublic, asPublic]),
      32,
    ),
  );
  const salt = crypto.randomBytes(16);
  const cek = Buffer.from(
    crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0", "utf8"), 16),
  );
  const nonce = Buffer.from(
    crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0", "utf8"), 12),
  );

  // One record: payload + 0x02 (final-record delimiter), AES-128-GCM.
  const plaintext = Buffer.concat([Buffer.from(payload, "utf8"), Buffer.from([0x02])]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

  const recordSize = Buffer.alloc(4);
  recordSize.writeUInt32BE(4096, 0);
  return Buffer.concat([
    salt,
    recordSize,
    Buffer.from([asPublic.length]),
    asPublic,
    ciphertext,
  ]);
}

async function sendOne(
  subscription: SubscriptionRow,
  payload: string,
): Promise<"sent" | "gone" | "failed"> {
  try {
    const body = encryptPayload(payload, subscription.p256dh, subscription.auth);
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        Authorization: vapidAuthorization(subscription.endpoint),
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: "86400",
      },
      body: new Uint8Array(body),
    });
    if (response.status === 200 || response.status === 201 || response.status === 202) {
      return "sent";
    }
    if (response.status === 404 || response.status === 410) return "gone";
    return "failed";
  } catch {
    return "failed";
  }
}

export async function POST(request: Request) {
  const adminSecret = process.env.PUSH_ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Push sending is not configured (PUSH_ADMIN_SECRET is not set)." },
      { status: 503 },
    );
  }
  const provided = request.headers.get("x-push-secret") ?? "";
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(adminSecret);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return NextResponse.json(
      { error: "Push sending is not configured (Supabase secret key is not set)." },
      { status: 503 },
    );
  }
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Push sending is not configured (VAPID keys are not set)." },
      { status: 503 },
    );
  }

  let title = "";
  let bodyText = "";
  let url = "/";
  try {
    const json = (await request.json()) as { title?: unknown; body?: unknown; url?: unknown };
    title = typeof json.title === "string" ? json.title.slice(0, 120) : "";
    bodyText = typeof json.body === "string" ? json.body.slice(0, 300) : "";
    url = typeof json.url === "string" && json.url.startsWith("/") ? json.url : "/";
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  if (!title || !bodyText) {
    return NextResponse.json({ error: "Both title and body are required." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (error) {
    return NextResponse.json({ error: "Could not read subscriptions." }, { status: 500 });
  }
  const subscriptions = (data ?? []) as SubscriptionRow[];
  const payload = JSON.stringify({ title, body: bodyText, url });

  let sent = 0;
  let failed = 0;
  const goneIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (subscription) => {
      const result = await sendOne(subscription, payload);
      if (result === "sent") sent += 1;
      else if (result === "gone") goneIds.push(subscription.id);
      else failed += 1;
    }),
  );
  if (goneIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", goneIds);
  }
  return NextResponse.json({ sent, failed, removed: goneIds.length });
}
