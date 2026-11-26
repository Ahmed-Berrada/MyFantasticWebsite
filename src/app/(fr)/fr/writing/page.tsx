import WritingIndexPage from "@/components/WritingIndexPage";
import { getDict } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

const t = getDict("fr");

export const metadata = pageMetadata({ lang: "fr", path: "/writing", title: t.meta.writingTitle, description: t.meta.writingDescription });

export default function Page() {
  return <WritingIndexPage lang="fr" />;
}
