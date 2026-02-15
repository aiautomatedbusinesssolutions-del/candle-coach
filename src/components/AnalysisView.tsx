"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, AlertTriangle, RefreshCw, BarChart3, Info } from "lucide-react";
import TickerSearch from "./TickerSearch";
import CandlestickChart from "./CandlestickChart";
import CandlestickIcon from "./CandlestickIcon";
import { detectPattern } from "@/lib/detectPattern";
import { SIGNAL_CONFIG } from "@/constants/patterns";
import type { AlphaVantageCandle } from "@/services/alphaVantage";
import type { SignalType } from "@/constants/patterns";

const SIGNAL_HEX: Record<SignalType, string> = {
  buy: "#22c55e",
  sell: "#ef4444",
  wait: "#eab308",
  neutral: "#94a3b8",
};

export default function AnalysisView() {
  console.log("DEBUG: AnalysisView rendering");

  const [ticker, setTicker] = useState("");
  const [candles, setCandles] = useState<AlphaVantageCandle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchMonthly = useCallback(async (symbol: string) => {
    console.log("DEBUG: fetchMonthly called for", symbol);
    setLoading(true);
    setError(null);
    setIsFallback(false);
    try {
      const res = await fetch(
        `/api/candles?symbol=${encodeURIComponent(symbol)}&timeframe=monthly`
      );
      console.log("DEBUG: fetch response status", res.status);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load data (${res.status})`);
      }
      const json = await res.json();
      console.log("DEBUG: got candles", json.candles?.length, "fallback:", json.fallback);
      setCandles(json.candles);
      setIsFallback(json.fallback === true);
    } catch (err) {
      console.log("DEBUG: fetchMonthly error", err);
      setCandles([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ticker) fetchMonthly(ticker);
  }, [ticker, fetchMonthly]);

  const signal = useMemo(() => detectPattern(candles), [candles]);
  const signalConfig = SIGNAL_CONFIG[signal.signal];
  const highlightColor = SIGNAL_HEX[signal.signal];

  return (
    <div className="space-y-6">
      <TickerSearch onSelect={setTicker} />

      {!ticker && (
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
          <BarChart3 className="h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-500">
            Search for a ticker symbol above to view its monthly chart
          </p>
        </div>
      )}

      {ticker && loading && (
        <div className="flex h-96 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      )}

      {ticker && error && (
        <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 text-center">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <p className="max-w-xs text-sm text-slate-400">{error}</p>
          <button
            onClick={() => fetchMonthly(ticker)}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}

      {ticker && !loading && !error && candles.length > 0 && (
        <>
          {/* Rate-limit fallback banner */}
          {isFallback && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <Info className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200">
                Daily API limit reached. Using simulated data for now.
              </p>
            </div>
          )}

          {/* Monthly Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                {ticker.toUpperCase()} — Monthly Chart
              </h2>
              <button
                onClick={() => fetchMonthly(ticker)}
                className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <CandlestickChart
              data={candles}
              timeframe="monthly"
              height={420}
              highlightColor={highlightColor}
            />
          </div>

          {/* Current Signal Box */}
          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: `${highlightColor}40`,
              background: `${highlightColor}08`,
            }}
          >
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Monthly Signal
            </h3>

            <div className="flex items-start gap-4">
              {signal.slug && (
                <CandlestickIcon
                  slug={signal.slug}
                  signal={signal.signal}
                  size={56}
                  className="shrink-0"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-100">
                    {signal.patternName}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-sm font-semibold ${signalConfig.bgColor} ${signalConfig.borderColor} ${signalConfig.color}`}
                  >
                    {signalConfig.label}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {signal.explanation}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
