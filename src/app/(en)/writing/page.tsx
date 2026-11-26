import WritingIndexPage from "@/components/WritingIndexPage";
import { getDict } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

const t = getDict("en");

export const metadata = pageMetadata({ lang: "en", path: "/writing", title: t.meta.writingTitle, description: t.meta.writingDescription });

export default function Page() {
  return <WritingIndexPage lang="en" />;
}
