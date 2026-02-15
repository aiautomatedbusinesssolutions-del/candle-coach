import { NextRequest, NextResponse } from "next/server";
import { fetchDailyCandles, AlphaVantageError } from "@/services/alphaVantage";
import { fetchDailyCandles as fetchMockCandles } from "@/services/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol");
  const timeframe = searchParams.get("timeframe") ?? "monthly";

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required 'symbol' query parameter." },
      { status: 400 }
    );
  }

  if (timeframe !== "monthly") {
    return NextResponse.json(
      { error: `Only the "monthly" timeframe is supported.` },
      { status: 400 }
    );
  }

  try {
    console.log(`DEBUG: Fetching real data for ${symbol}...`);
    const candles = await fetchDailyCandles(symbol, "monthly");
    console.log(`DEBUG: Got ${candles.length} candles for ${symbol}`);
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      candles,
      fallback: false,
    });
  } catch (err) {
    console.log(`DEBUG: Fetch error for ${symbol}:`, err instanceof Error ? err.message : err);
    // On rate limit, fall back to simulated data
    if (err instanceof AlphaVantageError && err.code === "RATE_LIMITED") {
      console.log(`DEBUG: Rate limited, falling back to mock data for ${symbol}`);
      const candles = await fetchMockCandles(symbol, "monthly");
      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        timeframe,
        candles,
        fallback: true,
      });
    }

    if (err instanceof AlphaVantageError) {
      const status =
        err.code === "INVALID_KEY"
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
