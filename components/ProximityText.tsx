"use client";
import { Fragment, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/src/lib/useInView";

interface Props {
  text: string;
  className?: string;
  /** Resting and peak weight / width of the variable font. */
  rest?: { wght: number; wdth: number };
  peak?: { wght: number; wdth: number };
  radius?: number;
}

/**
 * Splits text into letters whose weight and width swell as the pointer gets close.
 * Screen readers get the plain text; the letters are aria-hidden.
 */
export default function ProximityText({
  text,
  className,
  rest = { wght: 380, wdth: 82 },
  peak = { wght: 800, wdth: 100 },
  radius = 180,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-l]"));
    let centers: { x: number; y: number }[] = [];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const measure = () => {
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
      });
    };
    const paint = () => {
      raf = 0;
      letters.forEach((l, i) => {
        let k = 0;
        if (pointer) {
          const d = Math.hypot(centers[i].x - pointer.x, centers[i].y - pointer.y);
          k = Math.max(0, 1 - d / radius);
          k = k * k * (3 - 2 * k); // smoothstep
        }
        l.style.fontVariationSettings = `"wght" ${rest.wght + (peak.wght - rest.wght) * k}, "wdth" ${rest.wdth + (peak.wdth - rest.wdth) * k}`;
      });
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.pageX, y: e.pageY };
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      pointer = null;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    measure();
    // Width changes as letters swell; measure at rest only.
    const ro = new ResizeObserver(() => {
      pointer = null;
      paint();
      measure();
    });
    ro.observe(root);
    // Content above may change height after load; page positions move with it.
    ro.observe(document.body);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, radius, rest.wght, rest.wdth, peak.wght, peak.wdth]);

  const restStyle = { fontVariationSettings: `"wght" ${rest.wght}, "wdth" ${rest.wdth}` };
  return (
    <span ref={ref} className={className} role="img" aria-label={text}>
      <span aria-hidden>
        {text.split(" ").map((word, wi, words) => (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((ch, ci) => (
                <span key={ci} data-l className="inline-block transition-[font-variation-settings] duration-150 ease-out" style={restStyle}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
