import { OHLCVData } from './marketData';

/**
 * Simple Moving Average
 */
export function SMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    result.push(sum / period);
  }
  return result;
}

/**
 * Exponential Moving Average
 */
export function EMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is the SMA of the first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
    result.push(NaN);
  }
  result[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
    result.push(ema);
  }
  return result;
}

/**
 * Relative Strength Index
 */
export function RSI(data: number[], period: number = 14): number[] {
  const result: number[] = new Array(data.length).fill(NaN);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  if (gains.length < period) return result;

  // Initial average gain/loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    result[i + 1] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export function MACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const emaFast = EMA(data, fastPeriod);
  const emaSlow = EMA(data, slowPeriod);

  const macdLine: number[] = data.map((_, i) => {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) return NaN;
    return emaFast[i] - emaSlow[i];
  });

  // Signal line is EMA of valid MACD values
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalEma = EMA(validMacd, signalPeriod);

  const signalLine: number[] = new Array(data.length).fill(NaN);
  let validIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (!isNaN(macdLine[i])) {
      signalLine[i] = signalEma[validIdx] ?? NaN;
      validIdx++;
    }
  }

  const histogram: number[] = data.map((_, i) => {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) return NaN;
    return macdLine[i] - signalLine[i];
  });

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 */
export interface BollingerBandsResult {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function BollingerBands(data: number[], period: number = 20, stdDev: number = 2): BollingerBandsResult {
  const middle = SMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    let sumSqDiff = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSqDiff += Math.pow(data[j] - middle[i], 2);
    }
    const sd = Math.sqrt(sumSqDiff / period);
    upper.push(middle[i] + stdDev * sd);
    lower.push(middle[i] - stdDev * sd);
  }

  return { upper, middle, lower };
}

/**
 * VWAP (Volume Weighted Average Price)
 */
export function VWAP(ohlcv: OHLCVData[]): number[] {
  const result: number[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;

  for (const bar of ohlcv) {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    cumulativeTPV += typicalPrice * bar.volume;
    cumulativeVolume += bar.volume;
    result.push(cumulativeVolume === 0 ? 0 : cumulativeTPV / cumulativeVolume);
  }

  return result;
}

/**
 * Average True Range
 */
export function ATR(ohlcv: OHLCVData[], period: number = 14): number[] {
  const result: number[] = new Array(ohlcv.length).fill(NaN);
  const trueRanges: number[] = [];

  for (let i = 0; i < ohlcv.length; i++) {
    if (i === 0) {
      trueRanges.push(ohlcv[i].high - ohlcv[i].low);
    } else {
      const tr = Math.max(
        ohlcv[i].high - ohlcv[i].low,
        Math.abs(ohlcv[i].high - ohlcv[i - 1].close),
        Math.abs(ohlcv[i].low - ohlcv[i - 1].close)
      );
      trueRanges.push(tr);
    }
  }

  // First ATR is simple average
  if (trueRanges.length >= period) {
    let sum = 0;
    for (let i = 0; i < period; i++) sum += trueRanges[i];
    result[period - 1] = sum / period;

    for (let i = period; i < trueRanges.length; i++) {
      result[i] = (result[i - 1] * (period - 1) + trueRanges[i]) / period;
    }
  }

  return result;
}

/**
 * Stochastic Oscillator
 */
export interface StochasticResult {
  k: number[];
  d: number[];
}

export function Stochastic(ohlcv: OHLCVData[], kPeriod: number = 14, dPeriod: number = 3): StochasticResult {
  const k: number[] = new Array(ohlcv.length).fill(NaN);

  for (let i = kPeriod - 1; i < ohlcv.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    for (let j = i - kPeriod + 1; j <= i; j++) {
      if (ohlcv[j].high > highestHigh) highestHigh = ohlcv[j].high;
      if (ohlcv[j].low < lowestLow) lowestLow = ohlcv[j].low;
    }
    const range = highestHigh - lowestLow;
    k[i] = range === 0 ? 50 : ((ohlcv[i].close - lowestLow) / range) * 100;
  }

  // %D is SMA of %K
  const validK = k.filter((v) => !isNaN(v));
  const dSma = SMA(validK, dPeriod);
  const d: number[] = new Array(ohlcv.length).fill(NaN);
  let validIdx = 0;
  for (let i = 0; i < ohlcv.length; i++) {
    if (!isNaN(k[i])) {
      d[i] = dSma[validIdx] ?? NaN;
      validIdx++;
    }
  }

  return { k, d };
}

/**
 * On-Balance Volume
 */
export function OBV(ohlcv: OHLCVData[]): number[] {
  const result: number[] = [ohlcv[0]?.volume ?? 0];

  for (let i = 1; i < ohlcv.length; i++) {
    if (ohlcv[i].close > ohlcv[i - 1].close) {
      result.push(result[i - 1] + ohlcv[i].volume);
    } else if (ohlcv[i].close < ohlcv[i - 1].close) {
      result.push(result[i - 1] - ohlcv[i].volume);
    } else {
      result.push(result[i - 1]);
    }
  }

  return result;
}
