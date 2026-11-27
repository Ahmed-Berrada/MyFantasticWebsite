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
  // A small width range: a large one makes the line grow and slide letters out from under the pointer.
  peak = { wght: 800, wdth: 88 },
  radius = 180,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-l]"));
    let centers: { x: number; y: number }[] = [];
    let box = { left: 0, top: 0, right: 0, bottom: 0 };
    /** Current swell of each letter, eased towards its target every frame. */
    const k = letters.map(() => 0);
    const written = letters.map(() => -1);
    let pointer: { x: number; y: number } | null = null;
    let visible = false;
    let raf = 0;

    const measure = () => {
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
      });
      const r = root.getBoundingClientRect();
      box = { left: r.left + window.scrollX, top: r.top + window.scrollY, right: r.right + window.scrollX, bottom: r.bottom + window.scrollY };
    };
    const near = (p: { x: number; y: number } | null) =>
      !!p && p.x > box.left - radius && p.x < box.right + radius && p.y > box.top - radius && p.y < box.bottom + radius;

    // Easing in JS instead of a CSS transition on font-variation-settings: a transition forces a layout per letter
    // per frame, while this writes a style only when a letter's value actually changes, and stops when settled.
    const frame = () => {
      raf = 0;
      const p = near(pointer) ? pointer : null;
      let moving = false;
      letters.forEach((l, i) => {
        let target = 0;
        if (p) {
          const d = Math.hypot(centers[i].x - p.x, centers[i].y - p.y);
          const t = Math.max(0, 1 - d / radius);
          target = t * t * (3 - 2 * t); // smoothstep
        }
        k[i] += (target - k[i]) * 0.25;
        if (Math.abs(target - k[i]) < 0.005) k[i] = target;
        else moving = true;
        const q = Math.round(k[i] * 100) / 100;
        if (q !== written[i]) {
          written[i] = q;
          l.style.fontVariationSettings = `"wght" ${rest.wght + (peak.wght - rest.wght) * q}, "wdth" ${rest.wdth + (peak.wdth - rest.wdth) * q}`;
        }
      });
      if (moving) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      const was = near(pointer);
      pointer = { x: e.pageX, y: e.pageY };
      if (was || near(pointer)) wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };

    measure();
    // Width changes as letters swell; measure at rest only.
    const ro = new ResizeObserver(() => {
      if (k.every((v) => v === 0)) measure();
    });
    ro.observe(root);
    // Content above may change height after load; page positions move with it.
    ro.observe(document.body);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) measure();
    });
    io.observe(root);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
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
                <span key={ci} data-l className="inline-block" style={restStyle}>
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
