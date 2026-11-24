"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { profile } from "@/src/content/profile";
import { useScrolledPast } from "@/src/lib/useInView";

const links = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ground/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-medium tracking-tight">
          <span className="grid size-7 place-items-center rounded-[5px] bg-ink font-mono text-[11px] text-ground">AB</span>
          {profile.name}
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-2 transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
          <a
            href={profile.links.github.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line-2 px-3.5 py-1.5 text-sm transition-colors hover:border-ink"
          >
            GitHub ↗
          </a>
        </div>

        <button
          className="grid size-10 place-items-center md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 pb-5 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 text-base">
              {l.label}
            </a>
          ))}
          <a href={profile.links.github.href} target="_blank" rel="noreferrer" className="block py-3.5 text-base text-ink">
            GitHub ↗
          </a>
        </div>
      )}
    </nav>
  );
}
