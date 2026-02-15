const BASE_URL = "https://www.alphavantage.co/query";

// --- Types ---

export type Timeframe = "4h" | "daily" | "weekly" | "monthly";

export interface AlphaVantageCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolMatch {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export class AlphaVantageError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "RATE_LIMITED"
      | "INVALID_KEY"
      | "NO_DATA"
      | "NETWORK"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "AlphaVantageError";
  }
}

// --- Timeframe mapping ---

const TIMEFRAME_CONFIG: Record<
  string,
  { function: string; seriesKey: string; interval?: string }
> = {
  "4h": {
    function: "TIME_SERIES_INTRADAY",
    seriesKey: "Time Series (60min)",
    interval: "60min",
  },
  daily: {
    function: "TIME_SERIES_DAILY",
    seriesKey: "Time Series (Daily)",
  },
  weekly: {
    function: "TIME_SERIES_WEEKLY",
    seriesKey: "Weekly Time Series",
  },
  monthly: {
    function: "TIME_SERIES_MONTHLY",
    seriesKey: "Monthly Time Series",
  },
};

// --- Rate limiter ---
// Alpha Vantage free tier: 25 requests/day, max ~5/min.

const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 5;
const MINUTE_MS = 60_000;

function enforceRateLimit(): void {
  const now = Date.now();
  while (
    requestTimestamps.length > 0 &&
    now - requestTimestamps[0] > MINUTE_MS
  ) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = requestTimestamps[0];
    const waitSeconds = Math.ceil(
      (MINUTE_MS - (now - oldestInWindow)) / 1000
    );
    throw new AlphaVantageError(
      `Rate limit reached. Try again in ${waitSeconds}s.`,
      "RATE_LIMITED"
    );
  }
  requestTimestamps.push(now);
}

// --- Helpers ---

function getApiKey(): string {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) {
    throw new AlphaVantageError(
      "ALPHA_VANTAGE_API_KEY is not set. Add it to your .env.local file.",
      "INVALID_KEY"
    );
  }
  return key;
}

interface RawOHLCV {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. volume": string;
}

function parseCandles(
  timeSeries: Record<string, RawOHLCV>
): AlphaVantageCandle[] {
  return Object.entries(timeSeries)
    .map(([date, v]) => ({
      date,
      open: parseFloat(v["1. open"]),
      high: parseFloat(v["2. high"]),
      low: parseFloat(v["3. low"]),
      close: parseFloat(v["4. close"]),
      volume: parseInt(v["5. volume"], 10),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate 60-minute candles into 4-hour candles.
 * Groups by date + 4-hour block (0-3, 4-7, 8-11, 12-15, 16-19, 20-23).
 */
function aggregateTo4Hour(
  candles: AlphaVantageCandle[]
): AlphaVantageCandle[] {
  const groups = new Map<string, AlphaVantageCandle[]>();

  for (const candle of candles) {
    const spaceIdx = candle.date.indexOf(" ");
    const datePart = spaceIdx >= 0 ? candle.date.slice(0, spaceIdx) : candle.date;
    const timePart = spaceIdx >= 0 ? candle.date.slice(spaceIdx + 1) : "00:00:00";
    const hour = parseInt(timePart.split(":")[0], 10);
    const block = Math.floor(hour / 4) * 4;
    const key = `${datePart} ${block.toString().padStart(2, "0")}:00`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(candle);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      date: key,
      open: group[0].open,
      high: Math.max(...group.map((c) => c.high)),
      low: Math.min(...group.map((c) => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function checkResponseBody(data: Record<string, unknown>): void {
  if (typeof data["Note"] === "string") {
    throw new AlphaVantageError(
      "Alpha Vantage rate limit exceeded. Wait 1 minute before retrying.",
      "RATE_LIMITED"
    );
  }
  if (typeof data["Error Message"] === "string") {
    throw new AlphaVantageError(
      data["Error Message"] as string,
      "NO_DATA"
    );
  }
  if (typeof data["Information"] === "string") {
    const info = data["Information"] as string;
    if (info.toLowerCase().includes("api key")) {
      throw new AlphaVantageError(info, "INVALID_KEY");
    }
    throw new AlphaVantageError(info, "RATE_LIMITED");
  }
}

// --- Public API ---

export async function fetchDailyCandles(
  symbol: string,
  timeframe: Timeframe = "daily",
  outputSize: "compact" | "full" = "compact"
): Promise<AlphaVantageCandle[]> {
  enforceRateLimit();

  const apiKey = getApiKey();
  const config = TIMEFRAME_CONFIG[timeframe];

  const params = new URLSearchParams({
    function: config.function,
    symbol: symbol.toUpperCase(),
    apikey: apiKey,
  });

  if (config.interval) {
    params.set("interval", config.interval);
  }
  if (timeframe === "daily" || timeframe === "4h") {
    params.set("outputsize", outputSize);
  }

  const url = `${BASE_URL}?${params.toString()}`;

  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? "Request timed out after 5 seconds"
        : err instanceof Error
          ? err.message
          : "Failed to reach Alpha Vantage";
    throw new AlphaVantageError(`Network error: ${msg}`, "NETWORK");
  }

  if (!res.ok) {
    throw new AlphaVantageError(
      `Alpha Vantage returned HTTP ${res.status}`,
      "NETWORK"
    );
  }

  const data = await res.json();
  checkResponseBody(data);

  const timeSeries = data[config.seriesKey] as
    | Record<string, RawOHLCV>
    | undefined;

  if (!timeSeries || Object.keys(timeSeries).length === 0) {
    throw new AlphaVantageError(
      `No ${timeframe} data found for "${symbol}". Verify the ticker symbol is correct.`,
      "NO_DATA"
    );
  }

  const candles = parseCandles(timeSeries);
  return timeframe === "4h" ? aggregateTo4Hour(candles) : candles;
}

export async function searchSymbol(
  keywords: string
): Promise<SymbolMatch[]> {
  if (!keywords.trim()) return [];

  enforceRateLimit();

  const apiKey = getApiKey();
  const params = new URLSearchParams({
    function: "SYMBOL_SEARCH",
    keywords: keywords.trim(),
    apikey: apiKey,
  });

  const url = `${BASE_URL}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new AlphaVantageError(
      `Network error: ${err instanceof Error ? err.message : "Failed to reach Alpha Vantage"}`,
      "NETWORK"
    );
  }

  if (!res.ok) {
    throw new AlphaVantageError(
      `Symbol search returned HTTP ${res.status}`,
      "NETWORK"
    );
  }

  const data = await res.json();
  checkResponseBody(data);

  const matches = data["bestMatches"];
  if (!Array.isArray(matches)) return [];

  return matches.map((m: Record<string, string>) => ({
    symbol: m["1. symbol"],
    name: m["2. name"],
    type: m["3. type"],
    region: m["4. region"],
  }));
}
