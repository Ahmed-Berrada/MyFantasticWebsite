"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { profile } from "@/src/content/profile";
import { useReveal } from "@/src/lib/useInView";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

const field =
  "w-full rounded-md border border-line-2 bg-surface px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-muted focus:border-signal";

export default function Contact() {
  const ref = useReveal<HTMLElement>();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not send the message.");
      setStatus({ state: "sent" });
    } catch (err: unknown) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Could not send the message." });
    }
  };

  return (
    <section id="contact" ref={ref} className="border-t border-line bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeader
            index="04"
            label="Contact"
            title={<>Hiring for trading infrastructure or low&#8209;latency systems?</>}
            lede="I am looking for a full-time software engineering role from September 2027, in Paris."
          />
          <div className="reveal space-y-3">
            <button
              onClick={copyEmail}
              className="group flex w-full items-center justify-between rounded-lg border border-line-2 bg-paper px-4 py-3.5 text-left transition-colors hover:border-ink"
            >
              <span>
                <span className="block font-mono text-[11px] tracking-wider text-muted uppercase">Email</span>
                <span className="text-lg">{profile.email}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-ink-2" aria-live="polite">
                {copied ? <Check size={14} className="text-bid" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
            <div className="grid grid-cols-2 gap-3">
              {[profile.links.linkedin, profile.links.github].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-line-2 bg-paper px-4 py-3.5 transition-colors hover:border-ink"
                >
                  {l.label} <ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal lg:pt-24">
          {status.state === "sent" ? (
            <div className="rounded-lg border border-line-2 bg-paper p-8" role="status">
              <Check className="text-bid" />
              <p className="mt-3 text-lg font-medium">Message sent.</p>
              <p className="mt-1 text-ink-2">Thanks, I will get back to you shortly.</p>
              <button onClick={() => setStatus({ state: "idle" })} className="mt-5 text-sm text-signal hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-ink-2">Name</span>
                  <input name="name" required maxLength={100} autoComplete="name" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-ink-2">Email</span>
                  <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm text-ink-2">Message</span>
                <textarea name="message" required rows={6} maxLength={5000} className={`${field} resize-y`} />
              </label>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              {status.state === "error" && (
                <p className="text-sm text-ask" role="alert">
                  {status.message} You can also email me directly.
                </p>
              )}
              <button
                type="submit"
                disabled={status.state === "sending"}
                className="inline-flex items-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
              >
                {status.state === "sending" && <Loader2 size={16} className="animate-spin" />}
                {status.state === "sending" ? "Sending" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-line px-5 pt-8 font-mono text-xs text-muted md:px-8">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with Next.js · the order book above runs on its own engine</span>
      </footer>
    </section>
  );
}
