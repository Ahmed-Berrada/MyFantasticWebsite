import type { DagRun } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
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
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return null;
}

export function formatNumber(value: number | null, digits = 2): string {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatRows(value: number | null): string {
  if (value === null) {
    return "--";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getRowsInDb(raw: unknown): number | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const direct = asNumber(record.rows_total ?? record.total_rows ?? record.rowsInDb);
  if (direct !== null) {
    return direct;
  }

  const rowCounts = asRecord(record.row_counts ?? record.rowCounts);
  if (!rowCounts) {
    return null;
  }

  let total = 0;
  let hasValues = false;
  Object.values(rowCounts).forEach((value) => {
    const parsed = asNumber(value);
    if (parsed !== null) {
      total += parsed;
      hasValues = true;
    }
  });

  return hasValues ? total : null;
}

export function getDagRuns(raw: unknown): DagRun[] {
  const root = asRecord(raw);
  if (!root) {
    return [];
  }

  const nested = asRecord(root.data);
  const runs: unknown[] =
    (Array.isArray(root.dag_runs) ? root.dag_runs : null) ??
    (Array.isArray(root.runs) ? root.runs : null) ??
    (nested && Array.isArray(nested.dag_runs) ? nested.dag_runs : null) ??
    (nested && Array.isArray(nested.runs) ? nested.runs : null) ??
    [];

  return runs
    .map((entry: unknown) => {
      const item = asRecord(entry);
      if (!item) {
        return null;
      }

      return {
        name: asString(item.dag_id ?? item.pipeline ?? item.name ?? item.job) ?? "unknown",
        status: asString(item.status ?? item.state) ?? "unknown",
        durationSec: asNumber(item.duration_seconds ?? item.duration ?? item.runtime_sec),
        rowsInserted: asNumber(item.rows_inserted ?? item.row_count ?? item.rows),
        timestamp:
          asString(item.finished_at ?? item.updated_at ?? item.timestamp ?? item.start_date),
      } satisfies DagRun;
    })
    .filter((item: DagRun | null): item is DagRun => Boolean(item))
    .slice(0, 10);
}

export function getFreshness(timestamp: string | null): "fresh" | "stale" {
  if (!timestamp) {
    return "stale";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "stale";
  }

  return Date.now() - date.getTime() <= 6 * 60 * 60 * 1000 ? "fresh" : "stale";
}

export function getChangeLabel(price: number, changePercent: number | null): string {
  if (changePercent === null) {
    return "No change data";
  }

  const absolute = (price * changePercent) / 100;
  return `${absolute >= 0 ? "+" : ""}${formatNumber(absolute, 2)} (${changePercent >= 0 ? "+" : ""}${formatNumber(changePercent, 2)}%)`;
}

