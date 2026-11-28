"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrolledPast } from "@/src/lib/useInView";
import { LINKS, localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

interface Props {
  t: Dict["nav"];
  lang: Lang;
  /** The same page in the other language. */
  altPath: string;
  /** The CV PDF in this page's language, if it is published. */
  cvHref: string | null;
}

export default function Navbar({ t, lang, altPath, cvHref }: Props) {
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const home = localPath(lang, "/");

  // While the menu is open: Escape closes it and returns focus to the button, the page behind cannot scroll,
  // and the page behind is inert, so Tab stays inside the menu.
  useEffect(() => {
    if (!open) return;
    const behind = [...document.querySelectorAll<HTMLElement>("main, footer")];
    behind.forEach((el) => el.setAttribute("inert", ""));
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => el.removeAttribute("inert"));
      root.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** The section a page belongs to, for aria-current: notes under Writing, case studies under Work. */
  const current = (href: string) =>
    (href.endsWith("/writing") && pathname.includes("/writing")) || (href.endsWith("#work") && pathname.includes("/work/"));

  const links = [
    { label: t.siemens, href: `${home}#siemens` },
    { label: t.work, href: `${home}#work` },
    { label: t.writing, href: localPath(lang, "/writing") },
    { label: t.background, href: `${home}#background` },
    { label: t.contact, href: `${home}#contact` },
  ];

  return (
    <nav
      aria-label={t.label}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        open ? "border-b border-line bg-ground" : scrolled ? "border-b border-line bg-ground/90 backdrop-blur-sm" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href={home} className="font-display text-lg font-semibold tracking-tight">
          Ahmed Berrada
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={current(l.href) ? "page" : undefined}
              className="text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
            >
              {l.label}
            </Link>
          ))}
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="text-ink-2 transition-colors hover:text-ink">
            {t.linkedin}
          </a>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="text-ink-2 transition-colors hover:text-ink">
            {t.github}
          </a>
          <a href={altPath} hrefLang={t.switchLang} lang={t.switchLang} title={t.switchLabel} className="rounded-[3px] border border-line-2 px-2 py-1 font-mono text-xs transition-colors hover:border-ink">
            {t.switchShort}
          </a>
          {cvHref && (
            <a href={cvHref} className="rounded-[3px] bg-ink px-3.5 py-1.5 text-ground transition-colors hover:bg-accent hover:text-ink active:translate-y-px">
              {t.cv}
            </a>
          )}
        </div>

        <button ref={toggle} type="button" className="-mr-2 min-h-11 px-2 py-2 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          {open ? t.close : t.menu}
        </button>
      </div>

      {open && (
        <>
          {/* Tapping outside the menu closes it. */}
          <div aria-hidden className="fixed inset-x-0 top-16 bottom-0 -z-10 bg-ink/20 lg:hidden" onClick={() => setOpen(false)} />
          <div
            id="mobile-menu"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ground px-5 pb-4 transition-[opacity,translate] duration-200 ease-out starting:-translate-y-1 starting:opacity-0 lg:hidden"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 font-display text-2xl">
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4">
              <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="link link-tap">
                {t.linkedin}
              </a>
              <a href={LINKS.github} target="_blank" rel="noreferrer" className="link link-tap">
                {t.github}
              </a>
              {cvHref && (
                <a href={cvHref} className="link link-tap">
                  {t.cv}
                </a>
              )}
              <a href={altPath} hrefLang={t.switchLang} lang={t.switchLang} className="link link-tap">
                {t.switchLabel}
              </a>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
