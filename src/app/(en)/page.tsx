import HomePage from "@/components/HomePage";
import { getDict } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

const t = getDict("en");

export const metadata = pageMetadata({ lang: "en", path: "/", title: t.meta.homeTitle, description: t.meta.homeDescription });

export default function Home() {
  return <HomePage lang="en" />;
}
