import Link from "next/link";
import { localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

/** Three claims, each one click from its evidence. */
export default function ProofStrip({ t, lang }: { t: Dict["proof"]; lang: Lang }) {
  return (
    <section aria-label={t.label} className="border-y border-line-2">
      <ul className="mx-auto grid max-w-7xl md:grid-cols-3">
        {t.items.map((it, i) => (
          <li key={it.href} className={i > 0 ? "border-t border-line md:border-t-0 md:border-l" : ""}>
            <Link href={localPath(lang, it.href)} className="group block px-5 py-7 transition-colors duration-200 hover:bg-sunken md:px-8">
              <p className="font-mono text-[clamp(30px,3.4vw,44px)] leading-none font-medium tracking-tight tabular">{it.value}</p>
              <p className="mt-3 text-lg leading-snug group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{it.label}</p>
              <p className="mt-1.5 text-sm leading-snug text-ink-2">{it.note}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
