import Link from "next/link";
import { Fragment } from "react";
import { localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

const TOKEN = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

/** Text with `code` spans and [label](href) links. Internal hrefs are localised; external ones open in a new tab. */
export default function Rich({ text, lang }: { text: string; lang: Lang }) {
  return (
    <>
      {text
        .split(TOKEN)
        .filter(Boolean)
        .map((part, i) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={i} className="rounded-[3px] bg-sunken px-[0.3em] py-[0.1em] font-mono text-[0.8em] break-words text-ink">
                {part.slice(1, -1)}
              </code>
            );
          }
          const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (m) {
            const [, label, href] = m;
            return href.startsWith("/") ? (
              <Link key={i} href={localPath(lang, href)} className="link">
                {label}
              </Link>
            ) : (
              <a key={i} href={href} target="_blank" rel="noreferrer" className="link">
                {label}
              </a>
            );
          }
          return <Fragment key={i}>{part}</Fragment>;
        })}
    </>
  );
}
