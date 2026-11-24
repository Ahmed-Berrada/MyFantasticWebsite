"use client";
import { useEffect, useState } from "react";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";

const stages = [
  { name: "Pipeline triggered", detail: "GitLab CI, dedicated runner", ms: 900 },
  { name: "Boot CRG under test", detail: "QEMU/KVM, isolated Linux network namespaces", ms: 1400 },
  { name: "Start stimulation", detail: "CRG Message Generator plays CC, ZC and WRG", ms: 1200 },
  { name: "Run scenarios", detail: "Robot Framework library, pytest conformance suite", ms: 4200 },
  { name: "Archive results", detail: "JUnit-XML reports and logs, archived automatically", ms: 900 },
];
const SCENARIOS = 300;
const CAMPAIGN = 3;
const HOLD_MS = 3500;

export default function PipelineRun() {
  const reduced = usePrefersReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const [elapsed, setElapsed] = useState(0);
  const total = stages.reduce((s, x) => s + x.ms, 0);

  useEffect(() => {
    if (reduced || !onScreen) return;
    let raf = 0;
    let start = performance.now() - elapsed;
    const loop = (now: number) => {
      let e = now - start;
      if (e > total + HOLD_MS) {
        start = now;
        e = 0;
      }
      setElapsed(e);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resume from the current point, not restart
  }, [reduced, onScreen, total]);

  const t = reduced ? total : elapsed;
  let acc = 0;
  const state = stages.map((s) => {
    const begin = acc;
    acc += s.ms;
    return t >= acc ? "done" : t >= begin ? "running" : "queued";
  });
  const campaignStart = stages.slice(0, CAMPAIGN).reduce((s, x) => s + x.ms, 0);
  const passed = Math.max(0, Math.min(SCENARIOS, Math.floor(((t - campaignStart) / stages[CAMPAIGN].ms) * SCENARIOS)));
  const finished = t >= total;

  return (
    <div ref={ref} className="self-start overflow-hidden rounded-[6px] border border-line-2 bg-sheet lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-xs">
        <span className="text-ink-2">test-campaign</span>
        <span className={finished ? "text-bid" : "text-running"}>{finished ? "passed" : "running"}</span>
      </div>

      <ol className="px-4 py-3">
        {stages.map((s, i) => (
          <li key={s.name} className="grid grid-cols-[1.5rem_1fr] gap-x-2 py-2">
            <span className="mt-0.5">
              {state[i] === "done" ? (
                <span className="block font-mono text-sm leading-5 text-bid" aria-label="done">✓</span>
              ) : state[i] === "running" ? (
                <span className="mt-1 block size-3 animate-spin rounded-full border-[1.5px] border-running border-t-transparent" aria-label="running" />
              ) : (
                <span className="mt-1 ml-1 block size-2 rounded-full bg-line-2" aria-label="queued" />
              )}
            </span>
            <div>
              <p className={`text-sm ${state[i] === "queued" ? "text-muted" : "text-ink"}`}>{s.name}</p>
              <p className="font-mono text-[11px] text-muted">{s.detail}</p>
              {i === CAMPAIGN && (
                <div className="mt-2.5">
                  <div className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]" aria-hidden>
                    {Array.from({ length: SCENARIOS }, (_, k) => (
                      <span key={k} className={`aspect-square rounded-[1.5px] ${k < passed ? "bg-bid" : "bg-sunken"}`} />
                    ))}
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-ink-2 tabular">
                    {passed} / {SCENARIOS} scenarios
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="border-t border-line bg-sunken px-4 py-2 text-xs text-muted">An illustration of the pipeline I built. No project data.</p>
    </div>
  );
}
