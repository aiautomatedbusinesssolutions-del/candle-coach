import Header from "@/components/Header";
import { SIGNAL_CONFIG } from "@/constants/patterns";
import AnalysisView from "@/components/AnalysisView";

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Search + Charts */}
        <AnalysisView />

        {/* Signal legend */}
        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-300">
            Signal Legend
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              Object.entries(SIGNAL_CONFIG) as [
                string,
                (typeof SIGNAL_CONFIG)[keyof typeof SIGNAL_CONFIG],
              ][]
            ).map(([key, config]) => (
              <div
                key={key}
                className={`rounded-lg border p-2.5 ${config.bgColor} ${config.borderColor}`}
              >
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
