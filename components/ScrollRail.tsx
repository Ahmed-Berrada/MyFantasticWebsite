"use client";
import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

/** A thin rail on the right edge: a train marks how far down the page you are; stations jump to sections. */
export default function ScrollRail({ sections, aria }: { sections: Section[]; aria: string }) {
  const [p, setP] = useState(0);
  const [stops, setStops] = useState<number[]>([]);

  useEffect(() => {
    // The rail only exists from 1280 px (xl): below that, do no work at all on scroll.
    const wide = window.matchMedia("(min-width: 1280px)");
    let raf = 0;
    let detach = () => {};
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = sections.map(({ id }) => {
        const el = document.getElementById(id);
        return el && max > 0 ? Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max) : 0;
      });
      setStops((prev) => (prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]) < 1e-4) ? prev : next));
    };
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const attach = () => {
      detach();
      if (!wide.matches) return;
      measure();
      update();
      const ro = new ResizeObserver(measure);
      ro.observe(document.body);
      window.addEventListener("scroll", onScroll, { passive: true });
      detach = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    };
    attach();
    wide.addEventListener("change", attach);
    return () => {
      wide.removeEventListener("change", attach);
      detach();
    };
  }, [sections]);

  return (
    // Anchored to the content column on very wide screens instead of the window edge. It repeats the main nav,
    // so its links are out of the tab order: keyboard users already have the nav and the skip link.
    <nav aria-label={aria} className="fixed top-24 right-[max(20px,calc((100vw-80rem)/2-28px))] bottom-10 z-40 hidden w-6 xl:block">
      <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-2" />
      <span aria-hidden className="absolute top-0 left-1/2 w-[2px] -translate-x-1/2 bg-ink" style={{ height: `${p * 100}%` }} />
      {sections.map((s, i) => {
        const at = stops[i] ?? 0;
        const passed = p >= at - 0.002;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-[7px]"
            style={{ top: `${at * 100}%` }}
            aria-label={s.label}
            aria-current={passed && p < (stops[i + 1] ?? 2) - 0.002 ? "location" : undefined}
            tabIndex={-1}
          >
            <span className={`block size-2.5 rounded-full border-2 transition-colors ${passed ? "border-ink bg-ink" : "border-line-2 bg-ground"}`} />
            <span className="pointer-events-none absolute top-1/2 right-7 -translate-y-1/2 rounded-[3px] bg-ink px-2 py-1 text-xs whitespace-nowrap text-ground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              {s.label}
            </span>
          </a>
        );
      })}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-[22px] w-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-2 border-ink bg-accent"
        style={{ top: `${p * 100}%` }}
      />
    </nav>
  );
}
