"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PERIOD_OPTIONS, SNAPSHOT_SYMBOLS, type Period } from "./types";
import { useMarketDataPipeline } from "./useMarketDataPipeline";
import {
  formatDate,
  formatNumber,
  formatRows,
  getChangeLabel,
  getFreshness,
} from "./utils";

export default function MarketDataPipelinePage() {
  const [period, setPeriod] = useState<Period>(90);
  const { data, loading, error, trackedAssets } = useMarketDataPipeline(period);

  const aaplChart = useMemo(
    () =>
      data.aaplSeries.map((row) => ({
        ...row,
        label: new Date(row.time).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [data.aaplSeries]
  );

  const btcChart = useMemo(
    () =>
      data.btcSeries.map((row) => ({
        ...row,
        label: new Date(row.time).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [data.btcSeries]
  );

  const freshness = getFreshness(data.pipeline?.updatedAt ?? null);

  return (
    <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "120px 48px 80px" }}>
      <section style={{ marginBottom: "42px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
          <Link href="/" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}>
            {"<- BACK TO PORTFOLIO"}
          </Link>
          <a
            href="https://marketdatapipeline-production.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            {"OPEN LIVE API ->"}
          </a>
        </div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          border: `1px solid ${data.health ? "var(--accent-glow)" : "#7d3d47"}`,
          background: data.health ? "var(--accent-dim)" : "#7d3d4720",
          borderRadius: "100px",
          padding: "6px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.14em",
          color: data.health ? "var(--accent)" : "#e05c6e",
          marginBottom: "18px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: data.health ? "var(--accent)" : "#e05c6e" }} />
          {data.health ? "LIVE" : "OFFLINE"}
        </div>

        <h1 className="font-display" style={{ fontSize: "clamp(38px, 6vw, 66px)", lineHeight: 1.04, letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Market Data Pipeline
        </h1>
        <p style={{ fontSize: "16px", color: "var(--text-dim)", maxWidth: "720px", lineHeight: 1.8, marginBottom: "10px" }}>
          Live ETL pipeline for stocks and crypto with normalized OHLCV, API-first delivery,
          and analytics-ready datasets.
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
          STACK: AIRFLOW / TIMESCALEDB / FASTAPI / NEXT.JS
        </p>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }} className="kpi-grid">
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "10px" }}>TRACKED ASSETS</div>
            <div className="font-display" style={{ fontSize: "32px", marginBottom: "6px" }}>{trackedAssets || "--"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>
              {data.assets.stocks.length} stocks / {data.assets.crypto.length} crypto
            </div>
          </div>

          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "10px" }}>LAST PIPELINE RUN</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: data.pipeline?.status.toLowerCase().includes("success") ? "#3fcf8e" : "#e05c6e",
              }} />
              <span style={{ fontSize: "14px", textTransform: "uppercase" }}>{data.pipeline?.status ?? "unknown"}</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>
              {formatDate(data.pipeline?.updatedAt ?? null)}
            </div>
          </div>

          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "10px" }}>ROWS IN DB</div>
            <div className="font-display" style={{ fontSize: "32px", marginBottom: "6px" }}>{formatRows(data.rowsInDb)}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>summed from pipeline row_counts</div>
          </div>

          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "10px" }}>API STATUS</div>
            <div style={{ fontSize: "22px", color: data.health ? "#3fcf8e" : "#e05c6e", marginBottom: "8px" }}>
              {data.health ? "OK" : "KO"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)" }}>refreshed every 60s</div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
          <h2 className="font-display" style={{ fontSize: "30px", letterSpacing: "-0.015em" }}>Latest Market Snapshot</h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            Updated {formatDate(data.updatedAt || null)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }} className="snapshot-grid">
          {SNAPSHOT_SYMBOLS.map((item) => {
            const latest = data.latestBySymbol[item.symbol];
            const positive = (latest?.changePercent ?? 0) > 0;
            const negative = (latest?.changePercent ?? 0) < 0;

            return (
              <div key={item.symbol} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div className="font-display" style={{ fontSize: "22px" }}>{item.symbol}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>{item.kind}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
                    {formatDate(latest?.timestamp ?? null)}
                  </div>
                </div>

                <div style={{ fontSize: "26px", marginBottom: "8px" }}>
                  {latest ? `$${formatNumber(latest.price, latest.price > 1000 ? 2 : 4)}` : "--"}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: positive ? "#3fcf8e" : negative ? "#e05c6e" : "var(--text-muted)",
                }}>
                  {latest ? getChangeLabel(latest.price, latest.changePercent) : "No data"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: "48px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
          <h2 className="font-display" style={{ fontSize: "30px", letterSpacing: "-0.015em" }}>Charts</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {PERIOD_OPTIONS.map((value) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  borderRadius: "4px",
                  border: `1px solid ${period === value ? "var(--accent-glow)" : "var(--border)"}`,
                  background: period === value ? "var(--accent-dim)" : "transparent",
                  color: period === value ? "var(--accent)" : "var(--text-muted)",
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                {value === 365 ? "1Y" : `${value}D`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }} className="chart-grid">
          {[
            { title: `AAPL (${period === 365 ? "1Y" : `${period}D`})`, data: aaplChart, color: "var(--accent)" },
            { title: `BTC (${period === 365 ? "1Y" : `${period}D`})`, data: btcChart, color: "#5b8af5" },
          ].map((chart) => (
            <div key={chart.title} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "var(--text-dim)", marginBottom: "10px" }}>
                {chart.title}
              </div>
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer>
                  <LineChart data={chart.data}>
                    <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickMargin={8} minTickGap={28} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} width={56} domain={["auto", "auto"]} tickFormatter={(value: number) => `${value.toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{
                        background: "#0e1420",
                        border: "1px solid #23314a",
                        borderRadius: "6px",
                        color: "#e9ecf2",
                        fontSize: "12px",
                      }}
                      formatter={(value: unknown) => {
                        const numeric = typeof value === "number" ? value : Number(value);
                        return [`$${formatNumber(Number.isFinite(numeric) ? numeric : null, 2)}`, "Close"];
                      }}
                      labelStyle={{ color: "#8a9ab2", fontFamily: "var(--font-mono)", fontSize: "11px" }}
                    />
                    <Line type="monotone" dataKey="close" stroke={chart.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "48px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "18px" }} className="indicators-grid">
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px" }}>
          <h2 className="font-display" style={{ fontSize: "30px", marginBottom: "16px" }}>AAPL Indicators</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "CLOSE", value: data.indicators?.close, suffix: "" },
              { label: "SMA-20", value: data.indicators?.sma20, suffix: "" },
              { label: "SMA-50", value: data.indicators?.sma50, suffix: "" },
              { label: "DAILY RETURN", value: data.indicators?.dailyReturn, suffix: "%" },
            ].map((metric) => (
              <div key={metric.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "6px", padding: "14px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: "24px" }}>
                  {metric.value === null || metric.value === undefined ? "--" : `${formatNumber(metric.value, 2)}${metric.suffix}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px" }}>
          <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "14px" }}>Why this matters</h3>
          <p style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.9, marginBottom: "12px" }}>
            Indicators come from the pipeline API and show how clean market data directly powers analysis features.
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.8 }}>
            SMA-20 above SMA-50 usually signals stronger short-term momentum.
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "10px", flexWrap: "wrap" }}>
          <h2 className="font-display" style={{ fontSize: "30px" }}>Pipeline Observability</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: freshness === "fresh" ? "#3fcf8e" : "#e05c6e",
              border: `1px solid ${freshness === "fresh" ? "#3fcf8e66" : "#e05c6e66"}`,
              background: freshness === "fresh" ? "#3fcf8e1a" : "#e05c6e1a",
              borderRadius: "100px",
              padding: "5px 10px",
            }}>
              {freshness.toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
              Last updated {formatDate(data.pipeline?.updatedAt ?? null)}
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                {["DAG", "STATUS", "DURATION", "ROWS INSERTED", "TIMESTAMP"].map((head) => (
                  <th
                    key={head}
                    style={{
                      textAlign: "left",
                      padding: "11px 12px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.dagRuns.length > 0 ? (
                data.dagRuns.map((run, index) => {
                  const success = run.status.toLowerCase().includes("success");
                  const failed = run.status.toLowerCase().includes("fail");
                  return (
                    <tr key={`${run.name}-${index}`}>
                      <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text)" }}>
                        {run.name}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "11px", color: success ? "#3fcf8e" : failed ? "#e05c6e" : "var(--text-dim)" }}>
                        {run.status}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                        {run.durationSec === null ? "--" : `${formatNumber(run.durationSec, 1)}s`}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                        {formatRows(run.rowsInserted)}
                      </td>
                      <td style={{ padding: "12px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                        {formatDate(run.timestamp)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "18px 12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    No DAG run details exposed by current status payload.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(loading || error) && (
        <div style={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
          padding: "10px 12px",
          borderRadius: "6px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.08em",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          color: error ? "#e05c6e" : "var(--text-muted)",
        }}>
          {error || "Refreshing..."}
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .snapshot-grid { grid-template-columns: 1fr 1fr !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
          .indicators-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          main { padding: 100px 24px 56px !important; }
          .kpi-grid { grid-template-columns: 1fr !important; }
          .snapshot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}


