import { NextRequest, NextResponse } from "next/server";
import { searchSymbol, AlphaVantageError } from "@/services/alphaVantage";
import { searchSymbolFallback } from "@/services/mockData";

export async function GET(request: NextRequest) {
  const keywords = request.nextUrl.searchParams.get("q");

  if (!keywords || !keywords.trim()) {
    return NextResponse.json(
      { error: "Missing required 'q' query parameter." },
      { status: 400 }
    );
  }

  try {
    const results = await searchSymbol(keywords);
    return NextResponse.json({ results });
  } catch (err) {
    // On rate limit, fall back to basic symbol echo
    if (err instanceof AlphaVantageError && err.code === "RATE_LIMITED") {
      const results = searchSymbolFallback(keywords);
      return NextResponse.json({ results, fallback: true });
    }

    if (err instanceof AlphaVantageError) {
      const status =
        err.code === "INVALID_KEY" ? 401 :
        err.code === "NETWORK" ? 502 : 500;

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
