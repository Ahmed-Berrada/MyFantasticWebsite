import HomePage from "@/components/HomePage";
import { getDict } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

const t = getDict("fr");

export const metadata = pageMetadata({ lang: "fr", path: "/", title: t.meta.homeTitle, description: t.meta.homeDescription });

export default function Accueil() {
  return <HomePage lang="fr" />;
}
