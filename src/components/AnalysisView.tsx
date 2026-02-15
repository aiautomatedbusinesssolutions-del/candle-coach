"use client";

import { useState } from "react";
import TickerSearch from "./TickerSearch";
import ChartPanel from "./ChartPanel";
import { BarChart3 } from "lucide-react";

export default function AnalysisView() {
  const [ticker, setTicker] = useState<string>("");

  return (
    <div className="space-y-8">
      <TickerSearch onSelect={setTicker} />

      {ticker ? (
        <ChartPanel ticker={ticker} />
      ) : (
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
          <BarChart3 className="h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-500">
            Search for a ticker symbol above to view candlestick charts
          </p>
        </div>
      )}
    </div>
  );
}
