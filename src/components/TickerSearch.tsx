"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import type { SymbolMatch } from "@/services/alphaVantage";

interface TickerSearchProps {
  onSelect: (symbol: string) => void;
}

export default function TickerSearch({ onSelect }: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisplay, setSelectedDisplay] = useState("");

  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch search results on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    async function search() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Search failed (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setResults(data.results ?? []);
          setIsOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Search failed"
          );
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function handleSelect(match: SymbolMatch) {
    setSelectedDisplay(`${match.symbol} - ${match.name}`);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect(match.symbol);
  }

  function handleClear() {
    setSelectedDisplay("");
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect("");
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedDisplay("");
          }}
          placeholder={selectedDisplay || "Search ticker symbol (e.g. AAPL, TSLA)"}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
        {!isLoading && selectedDisplay && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
          {results.map((match) => (
            <li key={`${match.symbol}-${match.region}`}>
              <button
                onClick={() => handleSelect(match)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-700"
              >
                <span className="shrink-0 rounded bg-slate-900 px-2 py-0.5 font-mono font-semibold text-green-400">
                  {match.symbol}
                </span>
                <span className="truncate text-slate-300">{match.name}</span>
                <span className="ml-auto shrink-0 text-xs text-slate-500">
                  {match.region}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && results.length === 0 && !isLoading && !error && debouncedQuery && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-400">
          No results for &ldquo;{debouncedQuery}&rdquo;
        </div>
      )}
    </div>
  );
}
