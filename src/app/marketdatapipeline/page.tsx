import type { Metadata } from "next";
import MarketDataPipelinePage from "./MarketDataPipelinePage";

export const metadata: Metadata = {
  title: "Market Data Pipeline | Ahmed Berrada",
  description: "Live portfolio page for stocks and crypto ETL pipeline, API status, charts, and observability.",
};

export default function Page() {
  return <MarketDataPipelinePage />;
}

