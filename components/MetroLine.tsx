"use client";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/src/lib/useInView";

interface Stop {
  when: string;
  name: string;
  note: string;
  kind?: "interchange" | "terminus";
}

const stops: Stop[] = [
  { when: "2022", name: "ESIEA", note: "Engineering school, computer science" },
  { when: "2023", name: "Axeli", note: "Network intern" },
  { when: "2024", name: "Maroc Telecom", note: "Cloud and network intern" },
  { when: "2024", name: "ESIEA", note: "Student ambassador" },
  { when: "Sep 2025", name: "Siemens Mobility", note: "Apprentice software engineer", kind: "interchange" },
  { when: "Sep 2026", name: "GDG on Campus ESIEA", note: "Co-founder" },
  { when: "2026", name: "Junction", note: "Hackathon, Espoo" },
  { when: "Oct 2026", name: "AWS", note: "Certified AI Practitioner" },
  { when: "Sep 2027", name: "Next stop", note: "A permanent role, Paris", kind: "terminus" },
];

const LAST = stops.length - 1;
/** Where "today" sits on the line: between the AWS stop and the terminus. */
const NOW = (LAST - 0.6) / LAST;

export default function MetroLine() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the line enters the lower part of the screen, 1 once it reaches the upper third.
      const v = (vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.5);
      setP(Math.max(0, Math.min(1, v)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const progress = (reduced ? 1 : p) * NOW;

  return (
    <ol
      ref={ref}
      className="relative grid gap-9 pl-10 lg:grid-cols-9 lg:gap-4 lg:pt-14 lg:pl-0"
      style={{ ["--fill" as string]: progress }}
      aria-label="Path so far, as a metro line"
    >
      {/* track: dashed for the future, solid ink drawn in by scroll */}
      <span aria-hidden className="absolute top-2 bottom-2 left-[11px] w-0 border-l-2 border-dashed border-line-2 lg:top-[22px] lg:right-[5.5%] lg:bottom-auto lg:left-[5.5%] lg:h-0 lg:w-auto lg:border-t-2 lg:border-l-0" />
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[10px] w-1 origin-top scale-y-[var(--fill)] rounded bg-ink lg:top-[21px] lg:right-[5.5%] lg:bottom-auto lg:left-[5.5%] lg:h-1 lg:w-auto lg:origin-left lg:scale-x-[var(--fill)] lg:scale-y-100"
      />
      {/* the train riding the line */}
      <span
        aria-hidden
        className="absolute top-[calc(8px+var(--fill)*(100%-16px))] left-[3px] h-5 w-[18px] -translate-y-1/2 rounded-[3px] border-2 border-ink bg-accent lg:top-[23px] lg:left-[calc(5.5%+var(--fill)*89%)] lg:h-[18px] lg:w-7 lg:-translate-x-1/2"
      />

      {stops.map((s, i) => {
        const at = i / LAST;
        const visited = progress >= at - 0.001;
        const big = s.kind === "interchange";
        const end = s.kind === "terminus";
        return (
          <li key={`${s.name}-${s.when}`} className="group relative lg:text-center">
            <span
              aria-hidden
              className={`absolute top-1 -left-[37px] block rounded-full border-[3px] transition-colors duration-300 lg:static lg:mx-auto lg:-mt-[46px] lg:mb-5 ${
                big ? "size-6 lg:size-7" : "size-[18px] lg:size-5"
              } ${
                end
                  ? "border-ink bg-accent"
                  : visited
                    ? "border-ink bg-ink"
                    : "border-line-2 bg-ground"
              } group-hover:scale-125 motion-safe:transition-transform`}
            />
            <p className="text-sm text-muted tabular">{s.when}</p>
            <p className={`mt-1 leading-tight ${big || end ? "font-display text-xl font-semibold" : "font-medium"}`}>{s.name}</p>
            <p className="mt-1 text-sm leading-snug text-ink-2">{s.note}</p>
          </li>
        );
      })}
    </ol>
  );
}
