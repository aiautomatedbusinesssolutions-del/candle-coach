import { NextRequest, NextResponse } from "next/server";
import { type Timeframe, AlphaVantageError } from "@/services/alphaVantage";
import { fetchDailyCandles } from "@/services/mockData"; // swap to @/services/alphaVantage for real API

const VALID_TIMEFRAMES = new Set<Timeframe>(["4h", "daily", "weekly", "monthly"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol");
  const timeframe = (searchParams.get("timeframe") ?? "daily") as Timeframe;

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required 'symbol' query parameter." },
      { status: 400 }
    );
  }

  if (!VALID_TIMEFRAMES.has(timeframe)) {
    return NextResponse.json(
      {
        error: `Invalid timeframe "${timeframe}". Use 4h, daily, weekly, or monthly.`,
      },
      { status: 400 }
    );
  }

  try {
    const candles = await fetchDailyCandles(symbol, timeframe);
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      candles,
    });
  } catch (err) {
    if (err instanceof AlphaVantageError) {
      const status =
        err.code === "RATE_LIMITED"
          ? 429
          : err.code === "INVALID_KEY"
            ? 401
            : err.code === "NO_DATA"
              ? 404
              : err.code === "NETWORK"
                ? 502
                : 500;

      return NextResponse.json(
        { error: err.message, code: err.code },
        { status }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
