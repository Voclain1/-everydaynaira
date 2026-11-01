import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const { email, source } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !EMAIL.test(email.trim()))
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const clean = email.trim().toLowerCase();
  try {
    if (process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID) {
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email: clean, listIds: [Number(process.env.BREVO_LIST_ID)], updateEnabled: true, attributes: { SOURCE: source ?? "site" } }),
      });
      if (!res.ok && res.status !== 204) throw new Error(`Brevo ${res.status}`);
    } else if (process.env.NEWSLETTER_WEBHOOK_URL) {
      const res = await fetch(process.env.NEWSLETTER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, source: source ?? "site", at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
    } else {
      console.error("Newsletter: no provider configured (set BREVO_API_KEY + BREVO_LIST_ID or NEWSLETTER_WEBHOOK_URL)");
      return NextResponse.json({ error: "Sign-ups are temporarily unavailable." }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Newsletter signup failed", e);
    return NextResponse.json({ error: "We couldn't add you to the list just now." }, { status: 502 });
  }
}
