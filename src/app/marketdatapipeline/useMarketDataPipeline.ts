"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAssetsList,
  fetchBackendHealth,
  fetchCryptoLatest,
  fetchCryptoOhlcv,
  fetchPipelineStatus,
  fetchStockIndicators,
  fetchStockLatest,
  fetchStockOhlcv,
  type OhlcvPoint,
  type StockIndicators,
} from "@/src/lib/marketApi";
import type { MarketPipelineData, Period } from "./types";
import { getDagRuns, getRowsInDb } from "./utils";
import { SNAPSHOT_SYMBOLS } from "./types";

const EMPTY_DATA: MarketPipelineData = {
  health: false,
  assets: { stocks: [], crypto: [] },
  pipeline: null,
  rowsInDb: null,
  dagRuns: [],
  latestBySymbol: {},
  aaplSeries: [],
  btcSeries: [],
  indicators: null,
  updatedAt: "",
};

function computeIndicatorsFallback(series: OhlcvPoint[]): StockIndicators | null {
  if (series.length < 50) {
    return null;
  }

  const closes = series.map((row) => row.close);
  const last = closes[closes.length - 1] ?? null;
  const prev = closes[closes.length - 2] ?? null;

  const avg = (windowSize: number) => {
    const sample = closes.slice(-windowSize);
    if (sample.length !== windowSize) {
      return null;
    }
    return sample.reduce((sum, value) => sum + value, 0) / windowSize;
  };

  return {
    symbol: "AAPL",
    close: last,
    sma20: avg(20),
    sma50: avg(50),
    dailyReturn: last !== null && prev !== null && prev !== 0 ? ((last - prev) / prev) * 100 : null,
  };
}

export function useMarketDataPipeline(period: Period) {
  const [data, setData] = useState<MarketPipelineData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const latestRequests = SNAPSHOT_SYMBOLS.map(async (item) => {
        const latest =
          item.kind === "stock"
            ? await fetchStockLatest(item.symbol)
            : await fetchCryptoLatest(item.symbol);
        return [item.symbol, latest] as const;
      });

      const [health, assets, pipeline, latest, aaplSeries, btcSeries, indicators] = await Promise.allSettled([
        fetchBackendHealth(),
        fetchAssetsList(),
        fetchPipelineStatus(),
        Promise.all(latestRequests),
        fetchStockOhlcv("AAPL", period),
        fetchCryptoOhlcv("BTC", period),
        fetchStockIndicators("AAPL"),
      ]);

      if (!active) {
        return;
      }

      const stockSeries = aaplSeries.status === "fulfilled" ? aaplSeries.value : [];
      const indicatorData = indicators.status === "fulfilled"
        ? indicators.value
        : computeIndicatorsFallback(stockSeries);

      const pipelineData = pipeline.status === "fulfilled" ? pipeline.value : null;

      setData({
        health: health.status === "fulfilled" ? health.value : false,
        assets: assets.status === "fulfilled" ? assets.value : { stocks: [], crypto: [] },
        pipeline: pipelineData,
        rowsInDb: pipelineData ? getRowsInDb(pipelineData.raw) : null,
        dagRuns: pipelineData ? getDagRuns(pipelineData.raw) : [],
        latestBySymbol: latest.status === "fulfilled" ? Object.fromEntries(latest.value) : {},
        aaplSeries: stockSeries,
        btcSeries: btcSeries.status === "fulfilled" ? btcSeries.value : [],
        indicators: indicatorData,
        updatedAt: new Date().toISOString(),
      });

      if (health.status === "rejected") {
        setError("API unreachable from this client.");
      }

      setLoading(false);
    }

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [period]);

  const trackedAssets = useMemo(
    () => data.assets.stocks.length + data.assets.crypto.length,
    [data.assets.crypto.length, data.assets.stocks.length]
  );

  return {
    data,
    loading,
    error,
    trackedAssets,
  };
}

