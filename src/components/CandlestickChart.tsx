"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Customized,
  usePlotArea,
} from "recharts";
import type { AlphaVantageCandle, Timeframe } from "@/services/alphaVantage";

// How many candles to display per timeframe
const DISPLAY_LIMITS: Record<Timeframe, number> = {
  "4h": 30,
  daily: 60,
  weekly: 60,
  monthly: 24,
};

interface CandlestickChartProps {
  data: AlphaVantageCandle[];
  timeframe: Timeframe;
  height?: number;
  highlightColor?: string;
}

// ---- Date formatting ----

function formatDateTick(date: string, timeframe: Timeframe): string {
  if (timeframe === "4h") {
    const spaceIdx = date.indexOf(" ");
    const datePart = spaceIdx >= 0 ? date.slice(0, spaceIdx) : date;
    const timePart = spaceIdx >= 0 ? date.slice(spaceIdx + 1, spaceIdx + 6) : "";
    const parts = datePart.split("-");
    return `${parseInt(parts[1])}/${parseInt(parts[2])} ${timePart}`;
  }
  if (timeframe === "monthly") {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  // daily / weekly
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---- Custom Tooltip ----

function CandleTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: AlphaVantageCandle }> }) {
  if (!active || !payload?.[0]) return null;
  const c = payload[0].payload;
  const isUp = c.close >= c.open;
  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1 font-medium text-slate-300">{c.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-slate-500">Open</span>
        <span style={{ color }}>{c.open.toFixed(2)}</span>
        <span className="text-slate-500">High</span>
        <span className="text-slate-200">{c.high.toFixed(2)}</span>
        <span className="text-slate-500">Low</span>
        <span className="text-slate-200">{c.low.toFixed(2)}</span>
        <span className="text-slate-500">Close</span>
        <span style={{ color }}>{c.close.toFixed(2)}</span>
        <span className="text-slate-500">Vol</span>
        <span className="text-slate-400">{c.volume.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ---- Candlestick renderer (uses Recharts 3.x hooks) ----

const UP_COLOR = "#22c55e";
const DOWN_COLOR = "#ef4444";

function CandlestickRenderer(props: {
  candleData?: AlphaVantageCandle[];
  yMin?: number;
  yMax?: number;
  highlightColor?: string;
}) {
  const { candleData, yMin, yMax, highlightColor } = props;
  const plotArea = usePlotArea();

  if (!plotArea || !candleData?.length || yMin == null || yMax == null) return null;
  if (plotArea.width <= 0 || plotArea.height <= 0) return null;

  const yRange = yMax - yMin;
  if (yRange <= 0) return null;

  const n = candleData.length;
  const step = n > 1 ? plotArea.width / (n - 1) : plotArea.width;
  const barWidth = Math.max(n > 1 ? step * 0.55 : 12, 3);

  const toY = (value: number) =>
    plotArea.y + (1 - (value - yMin) / yRange) * plotArea.height;

  const toX = (index: number) =>
    plotArea.x + (n > 1 ? index * step : plotArea.width / 2);

  return (
    <g>
      {candleData.map((candle, i) => {
        const cx = toX(i);
        const yHigh = toY(candle.high);
        const yLow = toY(candle.low);
        const yOpen = toY(candle.open);
        const yClose = toY(candle.close);

        const isUp = candle.close >= candle.open;
        const isLast = i === n - 1;
        const color = isUp ? UP_COLOR : DOWN_COLOR;
        const glowColor = isLast && highlightColor ? highlightColor : color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);

        return (
          <g key={i}>
            {/* Highlight glow on the latest candle — uses signal color */}
            {isLast && (
              <rect
                x={cx - barWidth / 2 - 5}
                y={Math.min(yHigh, yLow) - 5}
                width={barWidth + 10}
                height={Math.abs(yLow - yHigh) + 10}
                rx={4}
                fill={glowColor}
                fillOpacity={0.12}
                stroke={glowColor}
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
            )}
            {/* Wick */}
            <line
              x1={cx}
              y1={yHigh}
              x2={cx}
              y2={yLow}
              stroke={color}
              strokeWidth={1.2}
            />
            {/* Body */}
            <rect
              x={cx - barWidth / 2}
              y={bodyTop}
              width={barWidth}
              height={bodyHeight}
              fill={color}
              stroke={isLast ? glowColor : color}
              strokeWidth={isLast ? 1.5 : 0.5}
              rx={1}
            />
          </g>
        );
      })}
    </g>
  );
}

// ---- Main chart component ----

export default function CandlestickChart({
  data,
  timeframe,
  height = 380,
  highlightColor,
}: CandlestickChartProps) {
  const displayData = useMemo(() => {
    const limit = DISPLAY_LIMITS[timeframe] || 60;
    return data.slice(-limit);
  }, [data, timeframe]);

  const yDomain = useMemo(() => {
    if (displayData.length === 0) return [0, 1] as [number, number];
    const lows = displayData.map((d) => d.low);
    const highs = displayData.map((d) => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.06 || 1;
    return [min - pad, max + pad] as [number, number];
  }, [displayData]);

  if (displayData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-slate-500">
        No data available
      </div>
    );
  }

  const tickInterval = Math.max(Math.floor(displayData.length / 6), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={displayData}
        margin={{ top: 12, right: 12, bottom: 4, left: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDateTick(d, timeframe)}
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
          interval={tickInterval}
        />
        <YAxis
          domain={yDomain}
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={65}
        />
        <Tooltip
          content={<CandleTooltip />}
          cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
        />
        {/* Hidden lines: keep tooltip payload working & anchor Y domain */}
        <Line
          dataKey="high"
          stroke="transparent"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="low"
          stroke="transparent"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        {/* Candlestick overlay using Recharts 3.x hooks */}
        <Customized
          component={CandlestickRenderer}
          candleData={displayData}
          yMin={yDomain[0]}
          yMax={yDomain[1]}
          highlightColor={highlightColor}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
