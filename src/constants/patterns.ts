export type SignalType = "buy" | "sell" | "wait" | "neutral";

export interface CandlestickPattern {
  name: string;
  slug: string;
  type: "single" | "double" | "triple";
  signal: SignalType;
  description: string;
  interpretation: string;
}

export const SIGNAL_CONFIG: Record<
  SignalType,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  buy: {
    label: "Buy Signal",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  sell: {
    label: "Sell Signal",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  wait: {
    label: "Wait / Caution",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  neutral: {
    label: "Neutral",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
};

export const CANDLESTICK_PATTERNS: CandlestickPattern[] = [
  // --- Single candle patterns ---
  {
    name: "Hammer",
    slug: "hammer",
    type: "single",
    signal: "buy",
    description:
      "A small body at the top with a long lower shadow, at least twice the body length. Appears at the bottom of a downtrend.",
    interpretation:
      "Sellers pushed price down during the session, but buyers regained control and pushed it back up. Signals potential reversal to the upside.",
  },
  {
    name: "Inverted Hammer",
    slug: "inverted-hammer",
    type: "single",
    signal: "buy",
    description:
      "A small body at the bottom with a long upper shadow. Appears at the bottom of a downtrend.",
    interpretation:
      "Buyers attempted to push price higher. Although sellers pushed it back, buying pressure is emerging. Confirmation needed on next candle.",
  },
  {
    name: "Hanging Man",
    slug: "hanging-man",
    type: "single",
    signal: "sell",
    description:
      "Identical to a hammer but appears at the top of an uptrend. Small body at top, long lower shadow.",
    interpretation:
      "Despite closing near the high, significant selling pressure appeared during the session. The uptrend may be losing strength.",
  },
  {
    name: "Shooting Star",
    slug: "shooting-star",
    type: "single",
    signal: "sell",
    description:
      "A small body at the bottom with a long upper shadow. Appears at the top of an uptrend.",
    interpretation:
      "Buyers pushed price up but sellers overwhelmed them by close. Strong indication the uptrend is reversing.",
  },
  {
    name: "Doji",
    slug: "doji",
    type: "single",
    signal: "wait",
    description:
      "Open and close are virtually equal, creating a cross or plus sign. Shadows can vary in length.",
    interpretation:
      "Market indecision — neither buyers nor sellers have control. Often precedes a reversal, but direction depends on context and confirmation.",
  },
  {
    name: "Marubozu",
    slug: "marubozu",
    type: "single",
    signal: "neutral",
    description:
      "A long body with no (or very small) shadows. Bullish marubozu has no upper shadow; bearish has no lower shadow.",
    interpretation:
      "Strong conviction in one direction. A bullish marubozu shows dominant buying; bearish shows dominant selling. Trend continuation likely.",
  },
  {
    name: "Spinning Top",
    slug: "spinning-top",
    type: "single",
    signal: "wait",
    description:
      "Small body centered between upper and lower shadows of roughly equal length.",
    interpretation:
      "Indecision in the market. Neither bulls nor bears could gain the upper hand. Watch for a breakout candle next.",
  },

  // --- Double candle patterns ---
  {
    name: "Bullish Engulfing",
    slug: "bullish-engulfing",
    type: "double",
    signal: "buy",
    description:
      "A small bearish candle followed by a larger bullish candle whose body completely engulfs the prior body. Appears in a downtrend.",
    interpretation:
      "Buyers have overwhelmed sellers. The larger bullish body shows a decisive shift in momentum to the upside.",
  },
  {
    name: "Bearish Engulfing",
    slug: "bearish-engulfing",
    type: "double",
    signal: "sell",
    description:
      "A small bullish candle followed by a larger bearish candle whose body completely engulfs the prior body. Appears in an uptrend.",
    interpretation:
      "Sellers have taken control from buyers. The engulfing bearish body signals strong downside momentum.",
  },
  {
    name: "Tweezer Tops",
    slug: "tweezer-tops",
    type: "double",
    signal: "sell",
    description:
      "Two consecutive candles with matching highs at the top of an uptrend. First is bullish, second is bearish.",
    interpretation:
      "Price hit resistance at the same level twice and was rejected. The repeated failure suggests a reversal.",
  },
  {
    name: "Tweezer Bottoms",
    slug: "tweezer-bottoms",
    type: "double",
    signal: "buy",
    description:
      "Two consecutive candles with matching lows at the bottom of a downtrend. First is bearish, second is bullish.",
    interpretation:
      "Price found support at the same level twice. The repeated bounce suggests a bottom has formed.",
  },

  // --- Triple candle patterns ---
  {
    name: "Morning Star",
    slug: "morning-star",
    type: "triple",
    signal: "buy",
    description:
      "Three-candle pattern: a long bearish candle, a small-bodied candle (star) that gaps down, and a long bullish candle that closes into the first candle's body.",
    interpretation:
      "The star shows indecision after a downtrend, and the strong bullish follow-through confirms the reversal to the upside.",
  },
  {
    name: "Evening Star",
    slug: "evening-star",
    type: "triple",
    signal: "sell",
    description:
      "Three-candle pattern: a long bullish candle, a small-bodied candle (star) that gaps up, and a long bearish candle that closes into the first candle's body.",
    interpretation:
      "The star signals exhaustion at the top, and the bearish follow-through confirms the reversal to the downside.",
  },
  {
    name: "Three White Soldiers",
    slug: "three-white-soldiers",
    type: "triple",
    signal: "buy",
    description:
      "Three consecutive long bullish candles, each opening within the prior body and closing at new highs. Small or no upper shadows.",
    interpretation:
      "Steady, strong buying pressure over three sessions. A powerful bullish continuation or reversal signal.",
  },
  {
    name: "Three Black Crows",
    slug: "three-black-crows",
    type: "triple",
    signal: "sell",
    description:
      "Three consecutive long bearish candles, each opening within the prior body and closing at new lows. Small or no lower shadows.",
    interpretation:
      "Relentless selling over three sessions. A strong bearish continuation or reversal signal.",
  },
];
