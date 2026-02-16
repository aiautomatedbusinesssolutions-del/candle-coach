"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface TickerSearchProps {
  onSelect: (symbol: string) => void;
}

export default function TickerSearch({ onSelect }: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedDisplay, setSelectedDisplay] = useState("");

  function handleSubmit() {
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;
    setSelectedDisplay(symbol);
    setQuery("");
    onSelect(symbol);
  }

  function handleClear() {
    setSelectedDisplay("");
    setQuery("");
    onSelect("");
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setSelectedDisplay("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder={selectedDisplay || "Type any ticker and press Enter (e.g. COIN, AAPL, TSLA)"}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
        {selectedDisplay ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          query.trim() && (
            <button
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600"
            >
              Go
            </button>
          )
        )}
      </div>
    </div>
  );
}
