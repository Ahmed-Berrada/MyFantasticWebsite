import type { Dict } from "@/src/content";

type Stop = Dict["background"]["stops"][number];

/**
 * The path so far as a two-line metro map: the ESIEA line runs the whole way, the Siemens Mobility line branches
 * off in September 2025, and both meet at the next stop. Stops are in date order, one column (desktop) or one row
 * (phone) each. Every column draws its own piece of each line, so the lines stay continuous at any width.
 * Static: no script, nothing to pause.
 */
export default function MetroMap({ stops, lines, label }: { stops: Stop[]; lines: Dict["background"]["lines"]; label: string }) {
  const n = stops.length;
  const firstWork = stops.findIndex((s) => s.line === "work");
  const last = n - 1;
  const onWork = (i: number) => i >= firstWork && i <= last;

  return (
    <div>
      <p className="mb-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-ink-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-6 rounded bg-ink" />
          {lines.school}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-6 rounded bg-accent" />
          {lines.work}
        </span>
      </p>

      <ol aria-label={label} className="grid lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] lg:[grid-template-rows:auto_4.5rem_auto]" style={{ "--n": n } as React.CSSProperties}>
        {stops.map((s, i) => {
          const work = s.line === "work";
          const end = s.line === "end";
          return (
            <li
              key={`${s.name}-${s.when}`}
              className="relative grid grid-cols-[4rem_1fr] pb-5 last:pb-0 lg:contents"
              style={{ "--col": i + 1 } as React.CSSProperties}
            >
              {/* Phone: two vertical tracks on the left. Desktop: two horizontal tracks in the middle row. */}
              <span aria-hidden className="relative block lg:[grid-column:var(--col)] lg:[grid-row:2]">
                {/* ESIEA track: from the first stop's centre to the last stop's centre */}
                <span
                  className={`absolute left-[10px] w-1 bg-ink lg:top-[18px] lg:h-1 ${
                    i === 0 ? "top-3 -bottom-5 lg:bottom-auto lg:left-1/2 lg:w-1/2" : i === last ? "top-0 h-3 lg:left-0 lg:w-1/2" : "top-0 -bottom-5 lg:bottom-auto lg:left-0 lg:w-full"
                  }`}
                />
                {/* Siemens track, from its first stop to the end, where it turns to meet the ESIEA line */}
                {onWork(i) && (
                  <span
                    className={`absolute left-[34px] w-1 bg-accent lg:top-[50px] lg:h-1 ${
                      i === firstWork
                        ? "top-3 -bottom-5 lg:bottom-auto lg:left-1/2 lg:w-1/2"
                        : i === last
                          ? "top-0 h-3 lg:left-0 lg:w-1/2"
                          : "top-0 -bottom-5 lg:bottom-auto lg:left-0 lg:w-full"
                    }`}
                  />
                )}
                {i === last && (
                  // the junction: the Siemens line joins the ESIEA line at the next stop
                  <span className="absolute top-[10px] left-[12px] h-1 w-[24px] bg-accent lg:top-[20px] lg:left-[calc(50%-2px)] lg:h-[34px] lg:w-1" />
                )}
                <span
                  className={`absolute block rounded-full border-[3px] border-ink ${end ? "top-0.5 left-0 size-6 bg-accent lg:top-[8px] lg:left-[calc(50%-12px)]" : work ? "top-0.5 left-[26px] size-5 bg-accent lg:top-[42px] lg:left-[calc(50%-10px)]" : "top-0.5 left-[2px] size-5 bg-ground lg:top-[10px] lg:left-[calc(50%-10px)]"}`}
                />
              </span>

              <div className={`lg:px-1 lg:text-center ${work ? "lg:[grid-row:3] lg:pt-3" : "lg:[grid-row:1] lg:self-end lg:pb-3"} lg:[grid-column:var(--col)]`}>
                {/* On a phone the date sits before the name, on one line; on the desktop map it sits above. */}
                <p className="leading-tight">
                  <span className="mr-2 text-sm text-muted tabular lg:mr-0 lg:block">{s.when}</span>
                  <span className={`lg:mt-0.5 lg:block ${end || work ? "font-display text-lg font-semibold" : "font-medium"}`}>{s.name}</span>
                </p>
                <p className="mt-1 text-sm leading-snug text-pretty text-ink-2">{s.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
