"use client";
import { useState } from "react";
import { profile } from "@/src/content/profile";
import { useScrolledPast } from "@/src/lib/useInView";

const links = [
  { label: "Siemens", href: "#siemens" },
  { label: "Engines", href: "#work" },
  { label: "Background", href: "#background" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Main"
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-ground/90 backdrop-blur-sm" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="font-display text-lg font-semibold tracking-tight">
          {profile.name}
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink-2 transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
          <a href={profile.links.github.href} target="_blank" rel="noreferrer" className="link">
            GitHub
          </a>
        </div>

        <button
          className="-mr-2 px-2 py-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line px-5 pb-4 md:hidden">
          {[...links, { label: "GitHub", href: profile.links.github.href }].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-3.5 font-display text-2xl last:border-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
