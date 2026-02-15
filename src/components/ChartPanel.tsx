"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import CandlestickChart from "./CandlestickChart";
import type { AlphaVantageCandle, Timeframe } from "@/services/alphaVantage";

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "4h", label: "4 Hour" },
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
];

interface ChartState {
  data: AlphaVantageCandle[];
  loading: boolean;
  error: string | null;
}

interface ChartPanelProps {
  ticker: string;
}

export default function ChartPanel({ ticker }: ChartPanelProps) {
  const [charts, setCharts] = useState<Record<Timeframe, ChartState>>({
    "4h": { data: [], loading: true, error: null },
    daily: { data: [], loading: true, error: null },
    weekly: { data: [], loading: false, error: null },
    monthly: { data: [], loading: true, error: null },
  });

  const fetchTimeframe = useCallback(
    async (tf: Timeframe) => {
      setCharts((prev) => ({
        ...prev,
        [tf]: { ...prev[tf], loading: true, error: null },
      }));

      try {
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(ticker)}&timeframe=${tf}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Failed to load ${tf} data (${res.status})`
          );
        }
        const json = await res.json();
        setCharts((prev) => ({
          ...prev,
          [tf]: { data: json.candles, loading: false, error: null },
        }));
      } catch (err) {
        setCharts((prev) => ({
          ...prev,
          [tf]: {
            data: [],
            loading: false,
            error: err instanceof Error ? err.message : "Unknown error",
          },
        }));
      }
    },
    [ticker]
  );

  // Fetch all three timeframes when ticker changes.
  // Stagger requests slightly to avoid hitting rate limits.
  useEffect(() => {
    if (!ticker) return;

    let cancelled = false;

    async function fetchAll() {
      for (const tf of TIMEFRAMES) {
        if (cancelled) return;
        fetchTimeframe(tf.key);
        // small stagger between requests
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [ticker, fetchTimeframe]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-100">
        {ticker.toUpperCase()} Charts
      </h2>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {TIMEFRAMES.map(({ key, label }) => {
          const state = charts[key];
          return (
            <div
              key={key}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">
                  {label}
                </h3>
                {!state.loading && (
                  <button
                    onClick={() => fetchTimeframe(key)}
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                    title="Refresh"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {state.loading && (
                <div className="flex h-80 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                </div>
              )}

              {state.error && (
                <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <p className="max-w-xs text-sm text-slate-400">
                    {state.error}
                  </p>
                  <button
                    onClick={() => fetchTimeframe(key)}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!state.loading && !state.error && (
                <CandlestickChart data={state.data} timeframe={key} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
