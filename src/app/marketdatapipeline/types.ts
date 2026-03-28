import type {
  LatestPrice,
  OhlcvPoint,
  PipelineStatus,
  StockIndicators,
} from "@/src/lib/marketApi";

export type Period = 30 | 90 | 365;

export type SnapshotSymbol = {
  symbol: string;
  kind: "stock" | "crypto";
};

export type DagRun = {
  name: string;
  status: string;
  durationSec: number | null;
  rowsInserted: number | null;
  timestamp: string | null;
};

export type MarketPipelineData = {
  health: boolean;
  assets: { stocks: string[]; crypto: string[] };
  pipeline: PipelineStatus | null;
  rowsInDb: number | null;
  dagRuns: DagRun[];
  latestBySymbol: Record<string, LatestPrice>;
  aaplSeries: OhlcvPoint[];
  btcSeries: OhlcvPoint[];
  indicators: StockIndicators | null;
  updatedAt: string;
};

export const SNAPSHOT_SYMBOLS: SnapshotSymbol[] = [
  { symbol: "AAPL", kind: "stock" },
  { symbol: "MSFT", kind: "stock" },
  { symbol: "NVDA", kind: "stock" },
  { symbol: "BTC", kind: "crypto" },
  { symbol: "ETH", kind: "crypto" },
  { symbol: "SOL", kind: "crypto" },
];

export const PERIOD_OPTIONS: Period[] = [30, 90, 365];

