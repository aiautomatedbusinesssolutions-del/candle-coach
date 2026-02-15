import { NextRequest, NextResponse } from "next/server";
import { AlphaVantageError } from "@/services/alphaVantage";
import { searchSymbol } from "@/services/mockData"; // kept on mock to save API quota

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
    if (err instanceof AlphaVantageError) {
      const status =
        err.code === "RATE_LIMITED" ? 429 :
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
