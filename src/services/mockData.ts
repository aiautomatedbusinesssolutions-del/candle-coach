import type { AlphaVantageCandle, Timeframe, SymbolMatch } from "./alphaVantage";

// --- Seed-based random for deterministic data per symbol ---

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// --- Price configs so different tickers look realistic ---

const PRICE_SEEDS: Record<string, { base: number; volatility: number }> = {
  AAPL: { base: 189, volatility: 3.5 },
  MSFT: { base: 415, volatility: 6 },
  GOOGL: { base: 175, volatility: 4 },
  AMZN: { base: 200, volatility: 5 },
  TSLA: { base: 245, volatility: 12 },
  NVDA: { base: 880, volatility: 20 },
  META: { base: 510, volatility: 8 },
  SPY: { base: 520, volatility: 4 },
};

const DEFAULT_SEED = { base: 150, volatility: 4 };

// --- Candle generator ---

function generateCandles(
  symbol: string,
  count: number,
  startDate: Date,
  stepDays: number
): AlphaVantageCandle[] {
  const config = PRICE_SEEDS[symbol.toUpperCase()] ?? DEFAULT_SEED;
  const rand = seededRandom(hashString(symbol.toUpperCase() + stepDays));
  const candles: AlphaVantageCandle[] = [];

  let price = config.base;

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * stepDays);

    // Skip weekends for daily data
    if (stepDays === 1) {
      const day = date.getDay();
      if (day === 0 || day === 6) continue;
    }

    const drift = (rand() - 0.48) * config.volatility;
    const open = +(price + (rand() - 0.5) * config.volatility * 0.3).toFixed(2);
    price = Math.max(price * 0.7, price + drift);
    const close = +price.toFixed(2);
    const high = +(Math.max(open, close) + rand() * config.volatility * 0.6).toFixed(2);
    const low = +(Math.min(open, close) - rand() * config.volatility * 0.6).toFixed(2);
    const volume = Math.round(30_000_000 + rand() * 70_000_000);

    const dateStr = date.toISOString().split("T")[0];
    candles.push({ date: dateStr, open, high, low, close, volume });
  }

  return candles;
}

function generateIntraday(symbol: string, days: number): AlphaVantageCandle[] {
  const config = PRICE_SEEDS[symbol.toUpperCase()] ?? DEFAULT_SEED;
  const rand = seededRandom(hashString(symbol.toUpperCase() + "4h"));
  const candles: AlphaVantageCandle[] = [];
  const start = new Date("2025-02-03");

  let price = config.base;

  for (let d = 0; d < days; d++) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split("T")[0];

    // Market hours: 4 blocks of 4h covering 09:30–17:30 roughly
    for (const hour of ["08:00", "12:00", "16:00"]) {
      const drift = (rand() - 0.48) * config.volatility * 0.6;
      const open = +(price + (rand() - 0.5) * config.volatility * 0.2).toFixed(2);
      price = Math.max(price * 0.7, price + drift);
      const close = +price.toFixed(2);
      const high = +(Math.max(open, close) + rand() * config.volatility * 0.4).toFixed(2);
      const low = +(Math.min(open, close) - rand() * config.volatility * 0.4).toFixed(2);
      const volume = Math.round(10_000_000 + rand() * 30_000_000);

      candles.push({ date: `${dateStr} ${hour}`, open, high, low, close, volume });
    }
  }

  return candles;
}

// --- Public API (same signatures as alphaVantage.ts) ---

export async function fetchDailyCandles(
  symbol: string,
  timeframe: Timeframe = "daily",
  _outputSize: "compact" | "full" = "compact"
): Promise<AlphaVantageCandle[]> {
  // Simulate a small network delay
  await new Promise((r) => setTimeout(r, 200));

  switch (timeframe) {
    case "4h":
      return generateIntraday(symbol, 30);
    case "daily":
      return generateCandles(symbol, 100, new Date("2024-10-01"), 1);
    case "weekly":
      return generateCandles(symbol, 52, new Date("2024-02-05"), 7);
    case "monthly":
      return generateCandles(symbol, 24, new Date("2023-03-01"), 30);
  }
}

// --- Symbol search fallback (used when Alpha Vantage is rate-limited) ---

export function searchSymbolFallback(keywords: string): SymbolMatch[] {
  if (!keywords.trim()) return [];
  const symbol = keywords.trim().toUpperCase();
  return [{ symbol, name: symbol, type: "Equity", region: "United States" }];
}
