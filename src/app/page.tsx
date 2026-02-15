import Header from "@/components/Header";
import AnalysisView from "@/components/AnalysisView";
import PatternCard from "@/components/PatternCard";
import { CANDLESTICK_PATTERNS } from "@/constants/patterns";

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

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Search + Monthly Chart + Current Signal */}
        <AnalysisView />

        {/* Divider */}
        <div className="my-12 border-t border-slate-800" />

        {/* Pattern Library */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-slate-100">
            Pattern Library
          </h2>
          <p className="mb-8 text-sm text-slate-400">
            Study 16 candlestick patterns — learn the shape, the signal, and
            what it means for your next trade.
          </p>

          {/* Single Candle Patterns */}
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">
              Single Candle Patterns
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {singlePatterns.map((pattern) => (
                <PatternCard key={pattern.slug} pattern={pattern} />
              ))}
            </div>
          </div>

          {/* Double Candle Patterns */}
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">
              Double Candle Patterns
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {doublePatterns.map((pattern) => (
                <PatternCard key={pattern.slug} pattern={pattern} />
              ))}
            </div>
          </div>

          {/* Triple Candle Patterns */}
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">
              Triple Candle Patterns
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {triplePatterns.map((pattern) => (
                <PatternCard key={pattern.slug} pattern={pattern} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
