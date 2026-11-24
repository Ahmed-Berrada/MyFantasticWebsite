"use client";
import { useInView } from "@/src/lib/useInView";

const runs = [
  { label: "Pure Python", stack: "loops", seconds: 295 },
  { label: "NumPy", stack: "vectorised CPU", seconds: 7.4 },
  { label: "CuPy", stack: "CUDA GPU", seconds: 0.46, highlight: true },
];

export default function SpeedupChart() {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const base = runs[0].seconds;
  const numpy = runs[1].seconds;

  return (
    <figure ref={ref}>
      <ul className="space-y-4">
        {runs.map((r, i) => (
          <li key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm">
                <span className={r.highlight ? "font-medium" : ""}>{r.label}</span>{" "}
                <span className="font-mono text-xs text-muted">{r.stack}</span>
              </span>
              <span className={`font-mono text-sm tabular ${r.highlight ? "text-ink" : "text-ink-2"}`}>
                {r.seconds} s{r.highlight ? `, ${Math.round(numpy / r.seconds)}× faster than NumPy` : ""}
              </span>
            </div>
            <div className="h-2.5 rounded-sm bg-sunken">
              <div
                className={`h-full rounded-sm transition-[width] duration-1000 ease-out ${r.highlight ? "bg-accent" : "bg-line-2"}`}
                style={{
                  // Keep the GPU bar visible: a linear scale makes the point, with a 0.6% floor.
                  width: seen ? `${Math.max(0.6, (r.seconds / base) * 100)}%` : "0%",
                  transitionDelay: `${i * 150}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="mt-4 text-sm text-muted">Same simulation, wall-clock time, linear scale.</figcaption>
    </figure>
  );
}
