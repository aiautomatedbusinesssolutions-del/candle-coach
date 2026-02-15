import type { SignalType } from "@/constants/patterns";

// ---- Candle shape definition ----

interface CandleDef {
  wickTop: number;
  bodyTop: number;
  bodyBottom: number;
  wickBottom: number;
  bullish: boolean;
}

type PatternLayout = "single" | "double" | "triple";

interface PatternVisual {
  layout: PatternLayout;
  candles: CandleDef[];
}

const GREEN = "#22c55e";
const RED = "#ef4444";
const YELLOW = "#eab308";
const SLATE = "#94a3b8";

// ---- Pattern visual data ----

const PATTERN_VISUALS: Record<string, PatternVisual> = {
  // --- Single candle patterns ---
  hammer: {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 8, bodyBottom: 16, wickBottom: 40, bullish: true }],
  },
  "inverted-hammer": {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 32, bodyBottom: 40, wickBottom: 40, bullish: true }],
  },
  "hanging-man": {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 8, bodyBottom: 16, wickBottom: 40, bullish: false }],
  },
  "shooting-star": {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 32, bodyBottom: 40, wickBottom: 40, bullish: false }],
  },
  doji: {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 22, bodyBottom: 26, wickBottom: 40, bullish: true }],
  },
  marubozu: {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 8, bodyBottom: 40, wickBottom: 40, bullish: true }],
  },
  "spinning-top": {
    layout: "single",
    candles: [{ wickTop: 8, bodyTop: 19, bodyBottom: 29, wickBottom: 40, bullish: true }],
  },

  // --- Double candle patterns ---
  "bullish-engulfing": {
    layout: "double",
    candles: [
      { wickTop: 14, bodyTop: 17, bodyBottom: 29, wickBottom: 33, bullish: false },
      { wickTop: 7, bodyTop: 10, bodyBottom: 36, wickBottom: 40, bullish: true },
    ],
  },
  "bearish-engulfing": {
    layout: "double",
    candles: [
      { wickTop: 14, bodyTop: 17, bodyBottom: 29, wickBottom: 33, bullish: true },
      { wickTop: 7, bodyTop: 10, bodyBottom: 36, wickBottom: 40, bullish: false },
    ],
  },
  "tweezer-tops": {
    layout: "double",
    candles: [
      { wickTop: 7, bodyTop: 10, bodyBottom: 28, wickBottom: 34, bullish: true },
      { wickTop: 7, bodyTop: 10, bodyBottom: 28, wickBottom: 34, bullish: false },
    ],
  },
  "tweezer-bottoms": {
    layout: "double",
    candles: [
      { wickTop: 14, bodyTop: 20, bodyBottom: 38, wickBottom: 41, bullish: false },
      { wickTop: 14, bodyTop: 20, bodyBottom: 38, wickBottom: 41, bullish: true },
    ],
  },

  // --- Triple candle patterns ---
  "morning-star": {
    layout: "triple",
    candles: [
      { wickTop: 5, bodyTop: 8, bodyBottom: 26, wickBottom: 30, bullish: false },
      { wickTop: 28, bodyTop: 31, bodyBottom: 35, wickBottom: 38, bullish: true },
      { wickTop: 8, bodyTop: 11, bodyBottom: 28, wickBottom: 32, bullish: true },
    ],
  },
  "evening-star": {
    layout: "triple",
    candles: [
      { wickTop: 18, bodyTop: 22, bodyBottom: 40, wickBottom: 43, bullish: true },
      { wickTop: 8, bodyTop: 11, bodyBottom: 15, wickBottom: 18, bullish: false },
      { wickTop: 16, bodyTop: 20, bodyBottom: 38, wickBottom: 42, bullish: false },
    ],
  },
  "three-white-soldiers": {
    layout: "triple",
    candles: [
      { wickTop: 28, bodyTop: 29, bodyBottom: 42, wickBottom: 43, bullish: true },
      { wickTop: 17, bodyTop: 18, bodyBottom: 30, wickBottom: 31, bullish: true },
      { wickTop: 5, bodyTop: 6, bodyBottom: 19, wickBottom: 20, bullish: true },
    ],
  },
  "three-black-crows": {
    layout: "triple",
    candles: [
      { wickTop: 5, bodyTop: 6, bodyBottom: 19, wickBottom: 20, bullish: false },
      { wickTop: 17, bodyTop: 18, bodyBottom: 30, wickBottom: 31, bullish: false },
      { wickTop: 28, bodyTop: 29, bodyBottom: 42, wickBottom: 43, bullish: false },
    ],
  },
};

// ---- Layout config ----

const LAYOUT_CONFIG: Record<PatternLayout, { positions: number[]; bodyWidth: number }> = {
  single: { positions: [30], bodyWidth: 14 },
  double: { positions: [19, 41], bodyWidth: 12 },
  triple: { positions: [11, 30, 49], bodyWidth: 10 },
};

// ---- Signal-based theme color ----

const SIGNAL_THEME: Record<SignalType, string> = {
  buy: GREEN,
  sell: RED,
  wait: YELLOW,
  neutral: SLATE,
};

// ---- Component ----

interface CandlestickIconProps {
  slug: string;
  signal: SignalType;
  size?: number;
  className?: string;
}

export default function CandlestickIcon({ slug, signal, size = 48, className }: CandlestickIconProps) {
  const visual = PATTERN_VISUALS[slug];
  if (!visual) return null;

  const { layout, candles } = visual;
  const { positions, bodyWidth } = LAYOUT_CONFIG[layout];
  const themeColor = SIGNAL_THEME[signal];

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `${themeColor}10`,
        border: `1px solid ${themeColor}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 60 48"
        width={size - 8}
        height={size - 8}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {candles.map((c, i) => {
          const cx = positions[i];
          const color = c.bullish ? GREEN : RED;
          const halfBody = bodyWidth / 2;

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={cx}
                y1={c.wickTop}
                x2={cx}
                y2={c.wickBottom}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              {/* Body */}
              <rect
                x={cx - halfBody}
                y={c.bodyTop}
                width={bodyWidth}
                height={Math.max(c.bodyBottom - c.bodyTop, 2)}
                rx={1.5}
                fill={color}
                stroke={color}
                strokeWidth={0.5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
