import Link from "next/link";
import { getDict } from "@/src/content";
import { localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

export default function NotFoundPage({ lang }: { lang: Lang }) {
  const t = getDict(lang).notFound;
  return (
    <main id="main" className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-5 py-24 md:px-8">
      <p className="text-ink-2">{t.code}</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] font-semibold tracking-[-0.03em]">{t.title}</h1>
      <p className="mt-6 text-xl text-ink-2">{t.body}</p>
      <p className="mt-8">
        <Link href={localPath(lang, "/")} className="link link-tap">
          {t.back}
        </Link>
      </p>
    </main>
  );
}
