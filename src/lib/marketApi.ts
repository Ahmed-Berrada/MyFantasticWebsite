type JsonRecord = Record<string, unknown>;

export interface AssetsListResponse {
  stocks: string[];
  crypto: string[];
}

export interface LatestPrice {
  symbol: string;
  price: number;
  timestamp: string | null;
  changePercent: number | null;
}

export interface OhlcvPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PipelineStatus {
  status: string;
  message: string | null;
  updatedAt: string | null;
  raw: unknown;
}

export interface StockIndicators {
  symbol: string;
  close: number | null;
  sma20: number | null;
  sma50: number | null;
  dailyReturn: number | null;
}

const API_TIMEOUT_MS = 10000;
const TEST_API_BASE_URL = process.env.NEXT_PUBLIC_MARKET_DATA_PIPELINE_API || ""; // The || "" is just to shut the error

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return null;
}

function normalizeSymbolList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.toUpperCase();
      }

      const record = asRecord(entry);
      const symbol = record ? asString(record.symbol ?? record.ticker) : null;
      return symbol ? symbol.toUpperCase() : null;
    })
    .filter((item): item is string => Boolean(item));
}

function getBaseUrl(): string {
  return TEST_API_BASE_URL;
}

async function marketFetch(path: string): Promise<unknown> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API ${response.status} on ${path}`);
    }

    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`API timeout on ${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchBackendHealth(): Promise<boolean> {
  await marketFetch("/");
  return true;
}

export async function fetchAssetsList(): Promise<AssetsListResponse> {
  const payload = await marketFetch("/api/assets/list");
  const record = asRecord(payload);

  return {
    stocks: normalizeSymbolList(record?.stocks),
    crypto: normalizeSymbolList(record?.crypto ?? record?.cryptos),
  };
}

function normalizeLatestPrice(payload: unknown, symbol: string): LatestPrice {
  const record = asRecord(payload);

  const price =
    asNumber(record?.price) ??
    asNumber(record?.last) ??
    asNumber(record?.close) ??
    asNumber(record?.value) ??
    0;

  return {
    symbol,
    price,
    timestamp: asString(record?.timestamp ?? record?.date ?? record?.datetime),
    changePercent:
      asNumber(record?.change_percent) ??
      asNumber(record?.changePercent) ??
      asNumber(record?.pct_change),
  };
}

function normalizeOhlcv(payload: unknown): OhlcvPoint[] {
  const rootRecord = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(rootRecord?.data)
      ? rootRecord.data
      : Array.isArray(rootRecord?.items)
        ? rootRecord.items
        : Array.isArray(rootRecord?.results)
          ? rootRecord.results
          : [];

  return rows
    .map((row) => {
      const record = asRecord(row);
      if (!record) {
        return null;
      }

      const time = asString(record.timestamp ?? record.date ?? record.datetime ?? record.time);
      const open = asNumber(record.open);
      const high = asNumber(record.high);
      const low = asNumber(record.low);
      const close = asNumber(record.close);

      if (!time || open === null || high === null || low === null || close === null) {
        return null;
      }

      return {
        time,
        open,
        high,
        low,
        close,
        volume: asNumber(record.volume) ?? 0,
      };
    })
    .filter((point): point is OhlcvPoint => Boolean(point));
}

function normalizeIndicators(payload: unknown, symbol: string): StockIndicators {
  const record = asRecord(payload);
  const indicators = asRecord(record?.indicators) ?? record;

  return {
    symbol,
    close: asNumber(indicators?.close ?? indicators?.price),
    sma20: asNumber(indicators?.sma_20 ?? indicators?.sma20 ?? indicators?.SMA20),
    sma50: asNumber(indicators?.sma_50 ?? indicators?.sma50 ?? indicators?.SMA50),
    dailyReturn:
      asNumber(indicators?.daily_return) ??
      asNumber(indicators?.dailyReturn) ??
      asNumber(indicators?.return_1d),
  };
}

export async function fetchStockLatest(symbol: string): Promise<LatestPrice> {
  const payload = await marketFetch(`/api/stocks/${encodeURIComponent(symbol)}/latest`);
  return normalizeLatestPrice(payload, symbol.toUpperCase());
}

export async function fetchCryptoLatest(symbol: string): Promise<LatestPrice> {
  const payload = await marketFetch(`/api/crypto/${encodeURIComponent(symbol)}/latest`);
  return normalizeLatestPrice(payload, symbol.toUpperCase());
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function fetchStockOhlcv(symbol: string, days = 90): Promise<OhlcvPoint[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const params = new URLSearchParams({
    from: toIsoDate(from),
    to: toIsoDate(to),
    limit: String(days),
  });

  const payload = await marketFetch(`/api/stocks/${encodeURIComponent(symbol)}/ohlcv?${params.toString()}`);
  return normalizeOhlcv(payload);
}

export async function fetchCryptoOhlcv(symbol: string, days = 90): Promise<OhlcvPoint[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const params = new URLSearchParams({
    from: toIsoDate(from),
    to: toIsoDate(to),
    limit: String(days),
  });

  const payload = await marketFetch(`/api/crypto/${encodeURIComponent(symbol)}/ohlcv?${params.toString()}`);
  return normalizeOhlcv(payload);
}

export async function fetchPipelineStatus(): Promise<PipelineStatus> {
  const payload = await marketFetch("/api/pipeline/status");
  const record = asRecord(payload);

  return {
    status: asString(record?.status) ?? "unknown",
    message: asString(record?.message),
    updatedAt: asString(record?.updated_at ?? record?.updatedAt ?? record?.timestamp),
    raw: payload,
  };
}

export async function fetchStockIndicators(symbol: string): Promise<StockIndicators> {
  const payload = await marketFetch(`/api/stocks/${encodeURIComponent(symbol)}/indicators`);
  return normalizeIndicators(payload, symbol.toUpperCase());
}

