import { CandlestickChart } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <CandlestickChart className="h-6 w-6 text-green-500" />
          <span className="text-lg font-bold text-slate-100">
            Candle Coach
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Patterns
          </Link>
          <Link
            href="/analysis"
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}
