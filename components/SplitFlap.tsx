"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, usePrefersReducedMotion } from "@/src/lib/useInView";

const CHARSET = " 0123456789+.";
const STEP_MS = 55;
const STAGGER_MS = 90;

interface Props {
  value: string;
  /** Pad on the left so boards line up, like a station display. */
  width?: number;
  label: string;
}

/** One departure-board row: each character flips through the charset until it lands. */
export default function SplitFlap({ value, width = 4, label }: Props) {
  const target = value.padStart(width, " ");
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  const reduced = usePrefersReducedMotion();
  const [chars, setChars] = useState<string[]>(() => Array.from(target, () => " "));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (reduced) return; // the render shows the target directly
    [...target].forEach((goal, i) => {
      const steps = Math.max(0, CHARSET.indexOf(goal));
      for (let k = 0; k <= steps; k++) {
        timers.current.push(
          setTimeout(() => {
            setChars((c) => {
              const next = [...c];
              next[i] = CHARSET[k];
              return next;
            });
          }, i * STAGGER_MS + k * STEP_MS),
        );
      }
    });
  }, [target, reduced]);

  useEffect(() => {
    if (seen) run();
  }, [seen, run]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div ref={ref} onMouseEnter={() => seen && run()} className="group">
      <div className="flex gap-[3px]" aria-hidden>
        {(reduced ? [...target] : chars).map((c, i) => (
          <span
            key={i}
            className="relative grid h-[50px] w-[33px] place-items-center overflow-hidden rounded-[3px] bg-ink font-mono text-[25px] text-ground [perspective:200px] md:h-[68px] md:w-[46px] md:text-[34px]"
          >
            <span key={c} className="flap block">
              {c === " " ? " " : c}
            </span>
            {/* the hinge */}
            <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#2a2e35]" />
          </span>
        ))}
      </div>
      <p className="mt-3 text-ink-2">
        <span className="sr-only">{value} </span>
        {label}
      </p>
      <style>{`
        .flap { animation: flap 120ms cubic-bezier(.3,.7,.4,1) both; transform-origin: 50% 50%; }
        @keyframes flap { from { transform: rotateX(-80deg); opacity: .35 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  );
}
