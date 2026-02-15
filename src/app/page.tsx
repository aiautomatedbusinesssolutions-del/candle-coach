import Header from "@/components/Header";
import PatternCard from "@/components/PatternCard";
import { CANDLESTICK_PATTERNS } from "@/constants/patterns";
import { BookOpen, TrendingUp, Eye } from "lucide-react";

export default function Home() {
  const singlePatterns = CANDLESTICK_PATTERNS.filter(
    (p) => p.type === "single"
  );
  const doublePatterns = CANDLESTICK_PATTERNS.filter(
    (p) => p.type === "double"
  );
  const triplePatterns = CANDLESTICK_PATTERNS.filter(
    (p) => p.type === "triple"
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Master Candlestick Patterns
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Learn to read the market&apos;s story through candlestick charts.
            Identify patterns, understand signals, and build your trading
            intuition.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center">
              <BookOpen className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <h3 className="font-semibold text-slate-100">Learn</h3>
              <p className="mt-1 text-sm text-slate-400">
                Study 16+ candlestick patterns with clear explanations
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center">
              <Eye className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <h3 className="font-semibold text-slate-100">Identify</h3>
              <p className="mt-1 text-sm text-slate-400">
                Spot patterns on real market data with live charts
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <h3 className="font-semibold text-slate-100">Analyze</h3>
              <p className="mt-1 text-sm text-slate-400">
                Understand buy, sell, and wait signals in context
              </p>
            </div>
          </div>
        </section>

        {/* Single Candle Patterns */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-100">
            Single Candle Patterns
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {singlePatterns.map((pattern) => (
              <PatternCard key={pattern.slug} pattern={pattern} />
            ))}
          </div>
        </section>

        {/* Double Candle Patterns */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-100">
            Double Candle Patterns
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {doublePatterns.map((pattern) => (
              <PatternCard key={pattern.slug} pattern={pattern} />
            ))}
          </div>
        </section>

        {/* Triple Candle Patterns */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-100">
            Triple Candle Patterns
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {triplePatterns.map((pattern) => (
              <PatternCard key={pattern.slug} pattern={pattern} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
