"use client";
import { useState, type FormEvent } from "react";
import { profile } from "@/src/content/profile";
import type { CvFile } from "@/src/content/cv";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

const field =
  "w-full rounded-[3px] border border-line-2 bg-sheet px-3.5 py-3 text-base outline-none transition-colors duration-150 placeholder:text-muted focus:border-ink";

export default function Contact({ cvs }: { cvs: CvFile[] }) {
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
      if (!res.ok) throw new Error(body.error ?? "The message could not be sent.");
      setStatus({ state: "sent" });
    } catch (err: unknown) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "The message could not be sent." });
    }
  };

  return (
    <section id="contact" className="border-t border-line-2 pt-24 md:pt-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-24">
        <div>
          <h2 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em] text-balance">
            Building something that cannot fail, or cannot wait?
          </h2>
          <p className="mt-8 max-w-[34rem] text-xl leading-relaxed text-ink-2 text-pretty">
            I am looking for a permanent software engineering role from September 2027, in Paris. Critical systems,
            infrastructure, low-latency or trading platforms.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a href={`mailto:${profile.email}`} className="link font-display text-2xl md:text-3xl">
              {profile.email}
            </a>
            <button
              onClick={copyEmail}
              className="rounded-[3px] border border-line-2 px-3 py-1.5 text-sm transition-colors hover:border-ink active:translate-y-px"
              aria-live="polite"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-6 flex gap-6">
            <a href={profile.links.linkedin.href} target="_blank" rel="noreferrer" className="link">
              LinkedIn
            </a>
            <a href={profile.links.github.href} target="_blank" rel="noreferrer" className="link">
              GitHub
            </a>
            {cvs.map((c) => (
              <a key={c.href} href={c.href} className="link">
                {c.label}
              </a>
            ))}
          </p>
        </div>

        <div className="lg:pt-4">
          {status.state === "sent" ? (
            <div className="border-l-4 border-accent py-2 pl-5" role="status">
              <p className="text-xl font-medium">Message sent.</p>
              <p className="mt-1 text-ink-2">It is in my inbox. I will answer from {profile.email}.</p>
              <button onClick={() => setStatus({ state: "idle" })} className="link mt-5">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <p className="text-ink-2">Or write here.</p>
              <div className="grid gap-5 sm:grid-cols-2">
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
                <p className="text-ask" role="alert">
                  {status.message} Email me directly instead.
                </p>
              )}
              <button
                type="submit"
                disabled={status.state === "sending"}
                className="rounded-[3px] bg-ink px-5 py-3 font-medium text-ground transition-colors duration-200 hover:bg-accent hover:text-ink active:translate-y-px disabled:opacity-60"
              >
                {status.state === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap justify-between gap-3 border-t border-line py-8 text-sm text-muted">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>The train graph, the order book and the pricer on this page run live in your browser.</span>
        </div>
      </footer>
    </section>
  );
}
