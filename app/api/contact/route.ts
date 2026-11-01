import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const f = (k: string, max = 200) => (typeof b[k] === "string" ? b[k].trim().slice(0, max) : "");
  const data = { firstName: f("firstName"), lastName: f("lastName"), email: f("email"), reason: f("reason"), url: f("url", 500), message: f("message", 5000) };
  if (b.company) return NextResponse.json({ ok: true });
  if (!data.firstName || !data.lastName || !EMAIL.test(data.email) || !data.reason || data.message.length < 5)
    return NextResponse.json({ error: "Fill in every required field with a valid email address." }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    console.error("Contact: RESEND_API_KEY not set");
    return NextResponse.json({ error: "The contact form is temporarily unavailable." }, { status: 503 });
  }
  const html = `<p><strong>${esc(data.firstName)} ${esc(data.lastName)}</strong> &lt;${esc(data.email)}&gt;</p>
<p><strong>Reason:</strong> ${esc(data.reason)}</p>${data.url ? `<p><strong>URL:</strong> ${esc(data.url)}</p>` : ""}
<p style="white-space:pre-wrap">${esc(data.message)}</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "EverydayNaira <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL || "ben@everydaynaira.com"],
      reply_to: data.email,
      subject: `[EverydayNaira] ${data.reason} — ${data.firstName} ${data.lastName}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return NextResponse.json({ error: "Your message could not be sent." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
