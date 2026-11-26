"use client";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/src/lib/useInView";

interface Stop {
  when: string;
  name: string;
  note: string;
}

/**
 * The path so far as a metro line, drawn by scroll. Stops come from the dictionary; the first column is centred
 * half a column in from the edge, so every offset below is derived from how many stops there are.
 */
export default function MetroLine({ stops, label }: { stops: Stop[]; label: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(0);

  const n = stops.length;
  const last = n - 1;
  /** Where "today" sits: past the last dated stop, before the final one. */
  const now = (last - 0.6) / last;

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

  const progress = (reduced ? 1 : p) * now;
  const style = {
    "--fill": progress,
    "--n": n,
    "--off": `${50 / n}%`,
    "--span": `${100 - 100 / n}%`,
  } as React.CSSProperties;

  return (
    <ol
      ref={ref}
      className="relative grid gap-9 pl-10 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] lg:gap-4 lg:pt-14 lg:pl-0"
      style={style}
      aria-label={label}
    >
      {/* track: dashed for the future, solid ink drawn in by scroll */}
      <span aria-hidden className="absolute top-2 bottom-2 left-[11px] w-0 border-l-2 border-dashed border-line-2 lg:top-[22px] lg:right-[var(--off)] lg:bottom-auto lg:left-[var(--off)] lg:h-0 lg:w-auto lg:border-t-2 lg:border-l-0" />
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[10px] w-1 origin-top scale-y-[var(--fill)] rounded bg-ink lg:top-[21px] lg:right-[var(--off)] lg:bottom-auto lg:left-[var(--off)] lg:h-1 lg:w-auto lg:origin-left lg:scale-x-[var(--fill)] lg:scale-y-100"
      />
      {/* the train riding the line */}
      <span
        aria-hidden
        className="absolute top-[calc(8px+var(--fill)*(100%-16px))] left-[3px] h-5 w-[18px] -translate-y-1/2 rounded-[3px] border-2 border-ink bg-accent lg:top-[23px] lg:left-[calc(var(--off)+var(--fill)*var(--span))] lg:h-[18px] lg:w-7 lg:-translate-x-1/2"
      />

      {stops.map((s, i) => {
        const at = i / last;
        const visited = progress >= at - 0.001;
        const big = s.name.startsWith("Siemens");
        const end = i === last;
        return (
          <li key={`${s.name}-${s.when}`} className="group relative lg:text-center">
            <span
              aria-hidden
              className={`absolute top-1 -left-[37px] block rounded-full border-[3px] transition-colors duration-300 lg:static lg:mx-auto lg:-mt-[46px] lg:mb-5 ${
                big ? "size-6 lg:size-7" : "size-[18px] lg:size-5"
              } ${end ? "border-ink bg-accent" : visited ? "border-ink bg-ink" : "border-line-2 bg-ground"} group-hover:scale-125 motion-safe:transition-transform`}
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
