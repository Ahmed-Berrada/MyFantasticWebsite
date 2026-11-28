import BenchFlow from "./BenchFlow";
import BookStructure from "./BookStructure";
import IdMapProbe from "./IdMapProbe";
import LatencyHistogram from "./LatencyHistogram";
import LobResults from "./LobResults";
import OrderPath from "./OrderPath";
import LiveOrderBook from "../LiveOrderBook";
import MonteCarloLab from "../MonteCarloLab";
import RadioLink from "../RadioLink";
import SpeedupChart from "../SpeedupChart";
import { getDict } from "@/src/content";
import type { FigureId, Lang } from "@/src/content/types";

/** Maps a figure id used in the content to its component, with that language's labels. */
export default function Figure({ id, lang }: { id: FigureId; lang: Lang }) {
  const d = getDict(lang);
  const t = d.figures;
  switch (id) {
    case "lob-structure":
      return <BookStructure t={t.structure} lang={lang} />;
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
    // The live demos: interactive figures inside the case studies and notes they illustrate.
    case "radio-link":
      return (
        <figure className="my-10">
          <RadioLink t={d.siemens.radio} />
        </figure>
      );
    case "order-book-demo":
      return (
        <figure className="my-10 max-w-2xl">
          <LiveOrderBook t={d.work.orderBookUi} lang={lang} />
          <figcaption className="mt-3 text-sm text-muted">{d.work.orderBook.demo}</figcaption>
        </figure>
      );
    case "mc-lab":
      return (
        <figure className="my-10 max-w-3xl">
          <MonteCarloLab t={d.work.mcUi} lang={lang} />
          <figcaption className="mt-3 text-sm text-muted">{d.work.pricer.demo}</figcaption>
        </figure>
      );
    case "mc-speedup":
      return (
        <div className="my-10 max-w-2xl">
          <SpeedupChart t={d.work.pricerChart} lang={lang} />
        </div>
      );
  }
}
