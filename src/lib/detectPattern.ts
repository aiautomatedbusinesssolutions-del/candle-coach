import type { AlphaVantageCandle } from "@/services/alphaVantage";
import type { SignalType } from "@/constants/patterns";

export interface DetectedSignal {
  patternName: string;
  slug: string | null;
  signal: SignalType;
  explanation: string;
}

// ---- Helpers ----

function bodySize(c: AlphaVantageCandle): number {
  return Math.abs(c.close - c.open);
}

function range(c: AlphaVantageCandle): number {
  return c.high - c.low;
}

function upperShadow(c: AlphaVantageCandle): number {
  return c.high - Math.max(c.open, c.close);
}

function lowerShadow(c: AlphaVantageCandle): number {
  return Math.min(c.open, c.close) - c.low;
}

function isBullish(c: AlphaVantageCandle): boolean {
  return c.close >= c.open;
}

type Trend = "up" | "down" | "flat";

function detectTrend(candles: AlphaVantageCandle[], lookback = 4): Trend {
  if (candles.length < 2) return "flat";

  const slice = candles.slice(-Math.min(lookback, candles.length));
  let ups = 0;
  let downs = 0;

  for (let i = 1; i < slice.length; i++) {
    if (slice[i].close > slice[i - 1].close) ups++;
    else if (slice[i].close < slice[i - 1].close) downs++;
  }

  if (ups > downs) return "up";
  if (downs > ups) return "down";
  return "flat";
}

// ---- Detection ----

export function detectPattern(candles: AlphaVantageCandle[]): DetectedSignal {
  if (candles.length === 0) {
    return { patternName: "No Data", slug: null, signal: "neutral", explanation: "No candle data available." };
  }

  const current = candles[candles.length - 1];
  const prev = candles.length >= 2 ? candles[candles.length - 2] : null;
  const prev2 = candles.length >= 3 ? candles[candles.length - 3] : null;

  const r = range(current);
  if (r === 0) {
    return { patternName: "Doji", slug: "doji", signal: "wait", explanation: "Open, high, low, and close are all equal — complete market indecision." };
  }

  const body = bodySize(current);
  const upper = upperShadow(current);
  const lower = lowerShadow(current);
  const bodyRatio = body / r;
  const isUp = isBullish(current);

  // Trend of the candles leading up to (but not including) the current one
  const priorCandles = candles.slice(0, -1);
  const trend = detectTrend(priorCandles);

  // --- Triple candle patterns (check first, most specific) ---

  if (prev && prev2) {
    const prev2Body = bodySize(prev2);
    const prev2Range = range(prev2);
    const prevBody = bodySize(prev);
    const prevRange = range(prev);
    const prev2BodyRatio = prev2Range > 0 ? prev2Body / prev2Range : 0;
    const prevBodyRatio = prevRange > 0 ? prevBody / prevRange : 0;

    // Three White Soldiers: three consecutive bullish candles with ascending closes
    if (
      isBullish(prev2) && isBullish(prev) && isUp &&
      prev.close > prev2.close && current.close > prev.close &&
      prev2BodyRatio > 0.5 && prevBodyRatio > 0.5 && bodyRatio > 0.5
    ) {
      return {
        patternName: "Three White Soldiers",
        slug: "three-white-soldiers",
        signal: "buy",
        explanation: "Three consecutive strong bullish candles with ascending closes — steady buying pressure signals a powerful upside move.",
      };
    }

    // Three Black Crows: three consecutive bearish candles with descending closes
    if (
      !isBullish(prev2) && !isBullish(prev) && !isUp &&
      prev.close < prev2.close && current.close < prev.close &&
      prev2BodyRatio > 0.5 && prevBodyRatio > 0.5 && bodyRatio > 0.5
    ) {
      return {
        patternName: "Three Black Crows",
        slug: "three-black-crows",
        signal: "sell",
        explanation: "Three consecutive strong bearish candles with descending closes — relentless selling pressure signals a continued downturn.",
      };
    }

    // Morning Star: long bearish, small body (star), long bullish
    if (
      !isBullish(prev2) && prev2BodyRatio > 0.5 &&
      prevBodyRatio < 0.3 &&
      isUp && bodyRatio > 0.4 &&
      current.close > (prev2.open + prev2.close) / 2
    ) {
      return {
        patternName: "Morning Star",
        slug: "morning-star",
        signal: "buy",
        explanation: "A small indecision candle between a bearish and bullish candle — the classic three-candle reversal pattern pointing to upside.",
      };
    }

    // Evening Star: long bullish, small body (star), long bearish
    if (
      isBullish(prev2) && prev2BodyRatio > 0.5 &&
      prevBodyRatio < 0.3 &&
      !isUp && bodyRatio > 0.4 &&
      current.close < (prev2.open + prev2.close) / 2
    ) {
      return {
        patternName: "Evening Star",
        slug: "evening-star",
        signal: "sell",
        explanation: "A small indecision candle between a bullish and bearish candle — the classic three-candle reversal pattern pointing to downside.",
      };
    }
  }

  // --- Double candle patterns ---

  if (prev) {
    const prevBody = bodySize(prev);
    const prevUp = isBullish(prev);
    const prevOpen = prev.open;
    const prevClose = prev.close;
    const curOpen = current.open;
    const curClose = current.close;

    // Bullish Engulfing: prev bearish, current bullish, current body engulfs prev body
    if (
      !prevUp && isUp &&
      curOpen <= Math.min(prevOpen, prevClose) &&
      curClose >= Math.max(prevOpen, prevClose) &&
      body > prevBody
    ) {
      return {
        patternName: "Bullish Engulfing",
        slug: "bullish-engulfing",
        signal: "buy",
        explanation: "A large bullish candle completely engulfs the prior bearish candle — a decisive shift in momentum to the upside.",
      };
    }

    // Bearish Engulfing: prev bullish, current bearish, current body engulfs prev body
    if (
      prevUp && !isUp &&
      curOpen >= Math.max(prevOpen, prevClose) &&
      curClose <= Math.min(prevOpen, prevClose) &&
      body > prevBody
    ) {
      return {
        patternName: "Bearish Engulfing",
        slug: "bearish-engulfing",
        signal: "sell",
        explanation: "A large bearish candle completely engulfs the prior bullish candle — sellers have taken control from buyers.",
      };
    }

    // Tweezer Tops: matching highs at top of uptrend
    if (
      trend === "up" &&
      Math.abs(current.high - prev.high) / r < 0.05 &&
      prevUp && !isUp
    ) {
      return {
        patternName: "Tweezer Tops",
        slug: "tweezer-tops",
        signal: "sell",
        explanation: "Two candles hit the same high and were rejected — price failed to break resistance twice, suggesting a reversal.",
      };
    }

    // Tweezer Bottoms: matching lows at bottom of downtrend
    if (
      trend === "down" &&
      Math.abs(current.low - prev.low) / r < 0.05 &&
      !prevUp && isUp
    ) {
      return {
        patternName: "Tweezer Bottoms",
        slug: "tweezer-bottoms",
        signal: "buy",
        explanation: "Two candles bounced off the same low — price found support at this level twice, suggesting a bottom has formed.",
      };
    }
  }

  // --- Single candle patterns ---

  // Doji: very small body relative to range
  if (bodyRatio < 0.1) {
    return {
      patternName: "Doji",
      slug: "doji",
      signal: "wait",
      explanation: "Open and close are nearly equal — the market is undecided. Wait for the next candle to confirm direction.",
    };
  }

  // Marubozu: body fills nearly the entire range (no shadows)
  if (bodyRatio > 0.85) {
    if (isUp) {
      return {
        patternName: "Marubozu",
        slug: "marubozu",
        signal: "buy",
        explanation: "A full-bodied bullish candle with almost no shadows — dominant buying conviction, trend continuation is likely.",
      };
    }
    return {
      patternName: "Marubozu",
      slug: "marubozu",
      signal: "sell",
      explanation: "A full-bodied bearish candle with almost no shadows — dominant selling conviction, trend continuation is likely.",
    };
  }

  // Hammer / Hanging Man: small body at top, long lower shadow
  if (bodyRatio < 0.35 && lower >= body * 2 && upper <= body * 0.5) {
    if (trend === "down") {
      return {
        patternName: "Hammer",
        slug: "hammer",
        signal: "buy",
        explanation: "A small body at the top with a long lower wick after a downtrend — sellers pushed price down but buyers fought back, signaling a potential reversal.",
      };
    }
    return {
      patternName: "Hanging Man",
      slug: "hanging-man",
      signal: "sell",
      explanation: "A small body at the top with a long lower wick after an uptrend — selling pressure is appearing despite the close near the high.",
    };
  }

  // Inverted Hammer / Shooting Star: small body at bottom, long upper shadow
  if (bodyRatio < 0.35 && upper >= body * 2 && lower <= body * 0.5) {
    if (trend === "down") {
      return {
        patternName: "Inverted Hammer",
        slug: "inverted-hammer",
        signal: "buy",
        explanation: "A small body at the bottom with a long upper wick after a downtrend — buying pressure is emerging even though sellers pushed it back.",
      };
    }
    return {
      patternName: "Shooting Star",
      slug: "shooting-star",
      signal: "sell",
      explanation: "A small body at the bottom with a long upper wick after an uptrend — buyers pushed up but sellers overwhelmed them by close.",
    };
  }

  // Spinning Top: small body, roughly equal shadows
  if (bodyRatio < 0.35 && upper > 0 && lower > 0) {
    const shadowRatio = Math.min(upper, lower) / Math.max(upper, lower);
    if (shadowRatio > 0.4) {
      return {
        patternName: "Spinning Top",
        slug: "spinning-top",
        signal: "wait",
        explanation: "A small body with balanced shadows — neither buyers nor sellers won this period. Watch for a breakout candle next.",
      };
    }
  }

  // --- Default: standard bullish/bearish ---

  if (isUp) {
    return {
      patternName: "Bullish Candle",
      slug: null,
      signal: "neutral",
      explanation: "A standard bullish candle — buyers controlled this period. No specific reversal or continuation pattern detected.",
    };
  }

  return {
    patternName: "Bearish Candle",
    slug: null,
    signal: "neutral",
    explanation: "A standard bearish candle — sellers controlled this period. No specific reversal or continuation pattern detected.",
  };
}
