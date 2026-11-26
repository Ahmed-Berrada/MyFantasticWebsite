import BenchFlow from "./BenchFlow";
import BookStructure from "./BookStructure";
import IdMapProbe from "./IdMapProbe";
import LatencyHistogram from "./LatencyHistogram";
import LobResults from "./LobResults";
import OrderPath from "./OrderPath";
import { getDict } from "@/src/content";
import type { FigureId, Lang } from "@/src/content/types";

/** Maps a figure id used in the content to its component, with that language's labels. */
export default function Figure({ id, lang }: { id: FigureId; lang: Lang }) {
  const t = getDict(lang).figures;
  switch (id) {
    case "lob-structure":
      return <BookStructure t={t.structure} />;
    case "lob-results":
      return <LobResults t={t.results} lang={lang} />;
    case "lob-histogram":
      return <LatencyHistogram t={t.histogram} lang={lang} />;
    case "id-map-probe":
      return <IdMapProbe t={t.probe} lang={lang} />;
    case "order-path":
      return <OrderPath t={t.order} />;
    case "cbtc-bench":
      return <BenchFlow t={t.bench} />;
  }
}
