"use client";
import { useEffect, useState } from "react";
import { useInView, usePrefersReducedMotion } from "@/src/lib/useInView";

interface CountUpProps {
  to: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

/** Counts from 0 to `to` once, when scrolled into view. Renders the final value without motion. */
export default function CountUp({ to, decimals = 0, durationMs = 1200, className }: CountUpProps) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.5);
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!seen || reduced) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, durationMs]);

  const value = reduced ? to : to * t;
  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
