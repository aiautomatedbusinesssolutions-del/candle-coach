import { CandlestickPattern } from "@/constants/patterns";
import SignalBadge from "./SignalBadge";
import CandlestickIcon from "./CandlestickIcon";

interface PatternCardProps {
  pattern: CandlestickPattern;
}

export default function PatternCard({ pattern }: PatternCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start gap-4">
        <CandlestickIcon
          slug={pattern.slug}
          signal={pattern.signal}
          size={52}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-100">
              {pattern.name}
            </h3>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {pattern.type}
            </span>
          </div>
          <SignalBadge signal={pattern.signal} />
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {pattern.description}
          </p>
          <p className="text-sm leading-relaxed text-slate-500 italic">
            {pattern.interpretation}
          </p>
        </div>
      </div>
    </div>
  );
}
