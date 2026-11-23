import { NextResponse } from "next/server";

const RECIPIENT = process.env.CONTACT_TO ?? "ahmed.berrada@proton.me";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 && s.length <= max ? s : null;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled: pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ success: true });
  }

  const name = str(body.name, 100);
  const email = str(body.email, 200);
  const message = str(body.message, 5000);
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address does not look valid." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "Portfolio Contact <onboarding@resend.dev>",
      to: RECIPIENT,
      replyTo: email,
      subject: `New message from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not send the message." }, { status: 502 });
  }
}
