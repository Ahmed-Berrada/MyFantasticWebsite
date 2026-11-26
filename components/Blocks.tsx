import Rich from "./Rich";
import Figure from "./figures/Figure";
import type { Block, Lang } from "@/src/content/types";

/** Renders article blocks. Prose stays in a reading column; tables, code and figures may use the full width. */
export default function Blocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i} className="mt-5 max-w-[44rem] text-lg leading-[1.7] text-ink-2 text-pretty">
                <Rich text={b.text} lang={lang} />
              </p>
            );
          case "h":
            return (
              <h3 key={i} className="mt-12 max-w-[44rem] font-display text-2xl leading-tight font-medium tracking-tight">
                {b.text}
              </h3>
            );
          case "list":
            return (
              <ul key={i} className="mt-5 max-w-[44rem] space-y-3 text-lg leading-[1.65] text-ink-2">
                {b.items.map((it) => (
                  <li key={it} className="relative pl-6 before:absolute before:top-[0.85em] before:left-0 before:h-px before:w-3.5 before:bg-ink">
                    <Rich text={it} lang={lang} />
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre key={i} className="my-6 overflow-x-auto rounded-[6px] border border-line bg-sheet p-4 font-mono text-[12.5px] leading-relaxed text-ink">
                <code>{b.text}</code>
              </pre>
            );
          case "table":
            return (
              <figure key={i} className="my-8">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-line-2">
                        {b.head.map((h) => (
                          <th key={h} className="px-3 py-2.5 font-medium text-ink-2">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, ri) => (
                        <tr key={ri} className="border-b border-line align-top">
                          {r.map((c, ci) => (
                            <td key={ci} className={`px-3 py-2.5 leading-snug ${ci === 0 ? "font-medium text-ink" : "text-ink-2"}`}>
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {b.note && <figcaption className="mt-3 text-sm text-muted">{b.note}</figcaption>}
              </figure>
            );
          case "figure":
            return <Figure key={i} id={b.id} lang={lang} />;
        }
      })}
    </>
  );
}
