import { OHLCVData } from './marketData';
import { RSI, MACD, SMA, EMA, BollingerBands, ATR, Stochastic, OBV } from './technicalAnalysis';

export type Recommendation = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
export type Timing = 'IMMEDIATE' | 'THIS_WEEK' | 'WATCH' | 'WAIT';

export interface Signal {
  indicator: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  description: string;
}

export interface ScoringResult {
  technicalScore: number;
  fundamentalScore: number;
  globalScore: number;
  recommendation: Recommendation;
  signals: Signal[];
}

export interface ActionableAnalysis {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  scoring: ScoringResult;
  action: {
    type: 'BUY' | 'SELL' | 'HOLD';
    timing: Timing;
    confidence: number;
    reason: string;
    targetPrice: number;
    stopLoss: number;
    potentialGain: number;
    potentialLoss: number;
    riskReward: number;
  };
  technicals: {
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    volatility: 'HIGH' | 'MEDIUM' | 'LOW';
    support: number;
    resistance: number;
    rsi: number;
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    bbPosition: number;
    stochK: number;
    stochD: number;
    volumeRatio: number;
  };
}

// --- Detect RSI divergence (price makes new low but RSI doesn't = bullish divergence) ---
function detectRSIDivergence(closes: number[], rsiValues: number[], lookback: number = 20): 'bullish' | 'bearish' | 'none' {
  const len = closes.length;
  if (len < lookback + 5) return 'none';

  const recentCloses = closes.slice(-lookback);
  const recentRSI = rsiValues.slice(-lookback).filter(v => !isNaN(v));
  if (recentRSI.length < lookback - 5) return 'none';

  const priceMin = Math.min(...recentCloses);
  const priceMax = Math.max(...recentCloses);
  const currentPrice = closes[len - 1];
  const currentRSI = rsiValues[len - 1];
  if (isNaN(currentRSI)) return 'none';

  // Bullish divergence: price near lows but RSI rising
  const priceNearLow = (currentPrice - priceMin) / (priceMax - priceMin || 1) < 0.2;
  const rsiMin = Math.min(...recentRSI.slice(0, Math.floor(recentRSI.length / 2)));
  const rsiRising = currentRSI > rsiMin + 5;
  if (priceNearLow && rsiRising && currentRSI < 45) return 'bullish';

  // Bearish divergence: price near highs but RSI falling
  const priceNearHigh = (currentPrice - priceMin) / (priceMax - priceMin || 1) > 0.8;
  const rsiMax = Math.max(...recentRSI.slice(0, Math.floor(recentRSI.length / 2)));
  const rsiFalling = currentRSI < rsiMax - 5;
  if (priceNearHigh && rsiFalling && currentRSI > 55) return 'bearish';

  return 'none';
}

// --- Detect candlestick reversal patterns ---
function detectReversalPattern(ohlcv: OHLCVData[]): { pattern: string; signal: 'bullish' | 'bearish' | 'neutral' } {
  const len = ohlcv.length;
  if (len < 3) return { pattern: '', signal: 'neutral' };

  const curr = ohlcv[len - 1];
  const prev = ohlcv[len - 2];
  const prev2 = ohlcv[len - 3];

  const bodySize = Math.abs(curr.close - curr.open);
  const upperShadow = curr.high - Math.max(curr.close, curr.open);
  const lowerShadow = Math.min(curr.close, curr.open) - curr.low;
  const totalRange = curr.high - curr.low;

  // Hammer (bullish reversal) - small body, long lower shadow, at bottom of downtrend
  if (totalRange > 0 && lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
    if (prev.close < prev.open && prev2.close < prev2.open) {
      return { pattern: 'Marteau (Hammer)', signal: 'bullish' };
    }
  }

  // Shooting star (bearish reversal) - small body, long upper shadow, at top of uptrend
  if (totalRange > 0 && upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
    if (prev.close > prev.open && prev2.close > prev2.open) {
      return { pattern: 'Étoile filante', signal: 'bearish' };
    }
  }

  // Bullish engulfing
  if (prev.close < prev.open && curr.close > curr.open &&
      curr.open <= prev.close && curr.close >= prev.open) {
    return { pattern: 'Englobante haussière', signal: 'bullish' };
  }

  // Bearish engulfing
  if (prev.close > prev.open && curr.close < curr.open &&
      curr.open >= prev.close && curr.close <= prev.open) {
    return { pattern: 'Englobante baissière', signal: 'bearish' };
  }

  // Morning star (3-candle bullish reversal)
  if (prev2.close < prev2.open && // first: bearish
      Math.abs(prev.close - prev.open) < (prev2.high - prev2.low) * 0.3 && // second: small body (doji-like)
      curr.close > curr.open && curr.close > (prev2.open + prev2.close) / 2) { // third: bullish closes above mid first
    return { pattern: 'Étoile du matin', signal: 'bullish' };
  }

  return { pattern: '', signal: 'neutral' };
}

// --- Detect support/resistance levels with pivot points ---
function findPivotLevels(ohlcv: OHLCVData[]): { support: number; resistance: number; pivotPoints: number[] } {
  const recent = ohlcv.slice(-60);
  const pivots: number[] = [];

  for (let i = 2; i < recent.length - 2; i++) {
    // Swing low (support)
    if (recent[i].low < recent[i - 1].low && recent[i].low < recent[i - 2].low &&
        recent[i].low < recent[i + 1].low && recent[i].low < recent[i + 2].low) {
      pivots.push(recent[i].low);
    }
    // Swing high (resistance)
    if (recent[i].high > recent[i - 1].high && recent[i].high > recent[i - 2].high &&
        recent[i].high > recent[i + 1].high && recent[i].high > recent[i + 2].high) {
      pivots.push(recent[i].high);
    }
  }

  const currentPrice = ohlcv[ohlcv.length - 1].close;
  const supports = pivots.filter(p => p < currentPrice).sort((a, b) => b - a);
  const resistances = pivots.filter(p => p > currentPrice).sort((a, b) => a - b);

  return {
    support: supports[0] || Math.min(...ohlcv.slice(-30).map(d => d.low)),
    resistance: resistances[0] || Math.max(...ohlcv.slice(-30).map(d => d.high)),
    pivotPoints: pivots,
  };
}

export function computeScore(ohlcv: OHLCVData[]): ScoringResult {
  if (ohlcv.length < 30) {
    return { technicalScore: 50, fundamentalScore: 50, globalScore: 50, recommendation: 'HOLD', signals: [] };
  }

  const closes = ohlcv.map((d) => d.close);
  const signals: Signal[] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  // === RSI (weight: 20) ===
  const rsiValues = RSI(closes, 14);
  const currentRSI = rsiValues[rsiValues.length - 1];
  if (!isNaN(currentRSI)) {
    const weight = 20;
    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

    if (currentRSI < 30) { score = 85; signalType = 'bullish'; desc = `RSI survendu (${currentRSI.toFixed(1)}) — rebond probable`; }
    else if (currentRSI < 40) { score = 70; signalType = 'bullish'; desc = `RSI bas (${currentRSI.toFixed(1)}) — zone d'accumulation`; }
    else if (currentRSI > 70) { score = 15; signalType = 'bearish'; desc = `RSI suracheté (${currentRSI.toFixed(1)}) — correction probable`; }
    else if (currentRSI > 60) { score = 35; signalType = 'bearish'; desc = `RSI élevé (${currentRSI.toFixed(1)}) — prudence`; }
    else { score = 50; signalType = 'neutral'; desc = `RSI neutre (${currentRSI.toFixed(1)})`; }

    signals.push({ indicator: 'RSI', value: currentRSI, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === MACD (weight: 20) ===
  const macd = MACD(closes);
  const lastHist = macd.histogram[macd.histogram.length - 1];
  const prevHist = macd.histogram[macd.histogram.length - 2];

  if (!isNaN(lastHist) && !isNaN(prevHist)) {
    const weight = 20;
    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;
    const histAccelerating = Math.abs(lastHist) > Math.abs(prevHist);

    if (lastHist > 0 && prevHist <= 0) { score = 90; signalType = 'bullish'; desc = 'MACD croisement haussier — signal d\'achat fort'; }
    else if (lastHist < 0 && prevHist >= 0) { score = 10; signalType = 'bearish'; desc = 'MACD croisement baissier — signal de vente fort'; }
    else if (lastHist > 0 && histAccelerating) { score = 70; signalType = 'bullish'; desc = 'MACD haussier en accélération'; }
    else if (lastHist > 0) { score = 60; signalType = 'bullish'; desc = 'MACD haussier mais ralentit'; }
    else if (lastHist < 0 && !histAccelerating) { score = 40; signalType = 'bearish'; desc = 'MACD baissier — décélère, rebond possible'; }
    else { score = 25; signalType = 'bearish'; desc = 'MACD baissier en accélération'; }

    signals.push({ indicator: 'MACD', value: lastHist, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === Trend MA (weight: 15) ===
  const sma20 = SMA(closes, 20);
  const sma50 = SMA(closes, Math.min(50, closes.length));
  const ema9 = EMA(closes, 9);
  const lastSma20 = sma20[sma20.length - 1];
  const lastSma50 = sma50[sma50.length - 1];
  const lastEma9 = ema9[ema9.length - 1];
  const currentPrice = closes[closes.length - 1];

  if (!isNaN(lastSma20) && !isNaN(lastSma50)) {
    const weight = 15;
    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

    if (currentPrice > lastEma9 && lastEma9 > lastSma20 && lastSma20 > lastSma50) {
      score = 90; signalType = 'bullish'; desc = 'Tendance haussière forte — prix > EMA9 > SMA20 > SMA50';
    } else if (lastSma20 > lastSma50 && currentPrice > lastSma20) {
      score = 75; signalType = 'bullish'; desc = 'Tendance haussière — prix au-dessus des moyennes';
    } else if (lastSma20 > lastSma50) {
      score = 60; signalType = 'bullish'; desc = 'Haussière mais prix sous SMA20 — pullback en cours';
    } else if (currentPrice < lastEma9 && lastEma9 < lastSma20 && lastSma20 < lastSma50) {
      score = 10; signalType = 'bearish'; desc = 'Tendance baissière forte — prix < EMA9 < SMA20 < SMA50';
    } else if (lastSma20 < lastSma50 && currentPrice < lastSma20) {
      score = 20; signalType = 'bearish'; desc = 'Tendance baissière — prix sous les moyennes';
    } else {
      score = 45; signalType = 'neutral'; desc = 'Tendance indécise — consolidation';
    }

    signals.push({ indicator: 'Tendance', value: lastSma20 - lastSma50, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === Bollinger (weight: 10) ===
  const bb = BollingerBands(closes, 20, 2);
  const lastUpper = bb.upper[bb.upper.length - 1];
  const lastLower = bb.lower[bb.lower.length - 1];

  if (!isNaN(lastUpper) && !isNaN(lastLower)) {
    const weight = 10;
    const bbPos = (currentPrice - lastLower) / (lastUpper - lastLower);
    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

    if (currentPrice <= lastLower) { score = 80; signalType = 'bullish'; desc = 'Prix sur bande basse Bollinger — zone d\'achat'; }
    else if (bbPos < 0.25) { score = 65; signalType = 'bullish'; desc = 'Prix proche bande basse — opportunité'; }
    else if (currentPrice >= lastUpper) { score = 20; signalType = 'bearish'; desc = 'Prix sur bande haute — zone de vente'; }
    else if (bbPos > 0.75) { score = 35; signalType = 'bearish'; desc = 'Prix proche bande haute — prise de profits'; }
    else { score = 50; signalType = 'neutral'; desc = 'Prix au milieu des Bollinger'; }

    signals.push({ indicator: 'Bollinger', value: bbPos * 100, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === Stochastic (weight: 10) ===
  const stoch = Stochastic(ohlcv, 14, 3);
  const stochK = stoch.k[stoch.k.length - 1];
  const stochD = stoch.d[stoch.d.length - 1];
  if (!isNaN(stochK) && !isNaN(stochD)) {
    const weight = 10;
    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

    if (stochK < 20 && stochK > stochD) { score = 85; signalType = 'bullish'; desc = `Stochastique survendu (${stochK.toFixed(0)}) avec croisement haussier`; }
    else if (stochK < 20) { score = 70; signalType = 'bullish'; desc = `Stochastique survendu (${stochK.toFixed(0)}) — rebond attendu`; }
    else if (stochK > 80 && stochK < stochD) { score = 15; signalType = 'bearish'; desc = `Stochastique suracheté (${stochK.toFixed(0)}) avec croisement baissier`; }
    else if (stochK > 80) { score = 30; signalType = 'bearish'; desc = `Stochastique suracheté (${stochK.toFixed(0)})`; }
    else { score = 50; signalType = 'neutral'; desc = `Stochastique neutre (${stochK.toFixed(0)})`; }

    signals.push({ indicator: 'Stochastique', value: stochK, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === Volume + Momentum (weight: 10) ===
  {
    const weight = 10;
    const momentum5d = closes.length >= 6 ? ((closes[closes.length - 1] / closes[closes.length - 6]) - 1) * 100 : 0;
    const avgVol = ohlcv.slice(-20).reduce((s, d) => s + d.volume, 0) / 20;
    const lastVol = ohlcv[ohlcv.length - 1].volume;
    const volumeRatio = avgVol > 0 ? lastVol / avgVol : 1;

    let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

    if (momentum5d > 3 && volumeRatio > 1.3) {
      score = 85; signalType = 'bullish'; desc = `Forte hausse +${momentum5d.toFixed(1)}% avec volume x${volumeRatio.toFixed(1)}`;
    } else if (momentum5d > 1) {
      score = 65; signalType = 'bullish'; desc = `Momentum positif +${momentum5d.toFixed(1)}% sur 5j`;
    } else if (momentum5d < -3 && volumeRatio > 1.3) {
      score = 15; signalType = 'bearish'; desc = `Forte baisse ${momentum5d.toFixed(1)}% volume élevé — capitulation`;
    } else if (momentum5d < -1) {
      score = 35; signalType = 'bearish'; desc = `Momentum négatif ${momentum5d.toFixed(1)}% sur 5j`;
    } else {
      score = 50; signalType = 'neutral'; desc = 'Momentum neutre';
    }

    signals.push({ indicator: 'Momentum', value: momentum5d, signal: signalType, weight, description: desc });
    weightedSum += score * weight; totalWeight += weight;
  }

  // === RSI Divergence (weight: 10) ===
  {
    const divergence = detectRSIDivergence(closes, rsiValues);
    if (divergence !== 'none') {
      const weight = 10;
      let score: number, signalType: 'bullish' | 'bearish' | 'neutral', desc: string;

      if (divergence === 'bullish') {
        score = 85; signalType = 'bullish'; desc = 'Divergence haussière RSI — prix bas mais RSI monte, retournement probable';
      } else {
        score = 15; signalType = 'bearish'; desc = 'Divergence baissière RSI — prix haut mais RSI baisse, retournement probable';
      }

      signals.push({ indicator: 'Divergence RSI', value: divergence === 'bullish' ? 1 : -1, signal: signalType, weight, description: desc });
      weightedSum += score * weight; totalWeight += weight;
    }
  }

  // === Candlestick Pattern (weight: 5) ===
  {
    const pattern = detectReversalPattern(ohlcv);
    if (pattern.signal !== 'neutral' && pattern.pattern) {
      const weight = 5;
      const score = pattern.signal === 'bullish' ? 80 : 20;
      signals.push({
        indicator: 'Pattern',
        value: pattern.signal === 'bullish' ? 1 : -1,
        signal: pattern.signal,
        weight,
        description: `${pattern.pattern} détecté — signal de retournement ${pattern.signal === 'bullish' ? 'haussier' : 'baissier'}`,
      });
      weightedSum += score * weight; totalWeight += weight;
    }
  }

  const technicalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  const fundamentalScore = 50;
  const globalScore = Math.round(technicalScore * 0.9 + fundamentalScore * 0.1);
  const recommendation = getRecommendation(globalScore);

  return { technicalScore, fundamentalScore, globalScore, recommendation, signals };
}

export function computeActionableAnalysis(
  ticker: string,
  name: string,
  sector: string,
  ohlcv: OHLCVData[],
  quote: { price: number; change: number; changePercent: number; volume: number }
): ActionableAnalysis {
  const scoring = computeScore(ohlcv);
  const closes = ohlcv.map((d) => d.close);
  const currentPrice = quote.price;

  // Pivot-based support/resistance
  const pivots = findPivotLevels(ohlcv);

  // ATR for stop loss / target
  const atrValues = ATR(ohlcv, 14);
  const atr = atrValues[atrValues.length - 1] || currentPrice * 0.02;

  // RSI
  const rsiValues = RSI(closes, 14);
  const rsi = rsiValues[rsiValues.length - 1] || 50;

  // Stochastic
  const stoch = Stochastic(ohlcv, 14, 3);
  const stochK = stoch.k[stoch.k.length - 1] || 50;
  const stochD = stoch.d[stoch.d.length - 1] || 50;

  // MACD
  const macd = MACD(closes);
  const lastHist = macd.histogram[macd.histogram.length - 1];
  const macdSignalType: 'bullish' | 'bearish' | 'neutral' = lastHist > 0 ? 'bullish' : lastHist < 0 ? 'bearish' : 'neutral';

  // Bollinger position
  const bb = BollingerBands(closes, 20, 2);
  const bbPos = bb.upper[bb.upper.length - 1] && bb.lower[bb.lower.length - 1]
    ? ((currentPrice - bb.lower[bb.lower.length - 1]) / (bb.upper[bb.upper.length - 1] - bb.lower[bb.lower.length - 1])) * 100
    : 50;

  // Volume ratio
  const avgVol = ohlcv.slice(-20).reduce((s, d) => s + d.volume, 0) / 20;
  const volumeRatio = avgVol > 0 ? quote.volume / avgVol : 1;

  // Trend
  const sma20 = SMA(closes, 20);
  const sma50 = SMA(closes, Math.min(50, closes.length));
  const lastSma20 = sma20[sma20.length - 1];
  const lastSma50 = sma50[sma50.length - 1];

  let trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' = 'SIDEWAYS';
  if (lastSma20 > lastSma50 && currentPrice > lastSma20) trend = 'UPTREND';
  else if (lastSma20 < lastSma50 && currentPrice < lastSma20) trend = 'DOWNTREND';

  const maDistance = lastSma50 > 0 ? Math.abs(lastSma20 - lastSma50) / lastSma50 * 100 : 0;
  const strength: 'STRONG' | 'MODERATE' | 'WEAK' = maDistance > 3 ? 'STRONG' : maDistance > 1 ? 'MODERATE' : 'WEAK';

  const atrPercent = currentPrice > 0 ? (atr / currentPrice) * 100 : 2;
  const volatility: 'HIGH' | 'MEDIUM' | 'LOW' = atrPercent > 3 ? 'HIGH' : atrPercent > 1.5 ? 'MEDIUM' : 'LOW';

  // === ACTIONABLE DECISION ===
  let actionType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let timing: Timing = 'WAIT';
  let confidence = 40;
  let reason = '';
  let targetPrice = currentPrice;
  let stopLoss = currentPrice;

  const score = scoring.globalScore;
  const bullishSignals = scoring.signals.filter((s) => s.signal === 'bullish').length;
  const bearishSignals = scoring.signals.filter((s) => s.signal === 'bearish').length;
  const hasDivergence = scoring.signals.some(s => s.indicator === 'Divergence RSI');
  const hasPattern = scoring.signals.some(s => s.indicator === 'Pattern');

  // Build dynamic reason with key indicators
  const buildReason = (base: string, extras: string[]): string => {
    return `${base} ${extras.join('. ')}.`;
  };

  if (score >= 75 && bullishSignals >= 4) {
    actionType = 'BUY';
    timing = 'IMMEDIATE';
    confidence = Math.min(95, score + bullishSignals * 3);
    targetPrice = Math.max(currentPrice + atr * 3, pivots.resistance);
    stopLoss = Math.max(currentPrice - atr * 1.5, pivots.support);
    const extras = [`RSI ${rsi.toFixed(0)}`, `${bullishSignals} signaux haussiers convergent`];
    if (hasDivergence) extras.push('Divergence RSI confirmée');
    if (hasPattern) extras.push('Pattern de retournement détecté');
    reason = buildReason('ACHAT IMMÉDIAT recommandé.', extras);
  } else if (score >= 65 && bullishSignals >= 3) {
    actionType = 'BUY';
    timing = 'IMMEDIATE';
    confidence = Math.min(90, score + bullishSignals * 2);
    targetPrice = currentPrice + atr * 2.5;
    stopLoss = Math.max(currentPrice - atr * 1.5, pivots.support);
    reason = buildReason('Signal d\'achat fort.', [`${bullishSignals} indicateurs positifs`, `Tendance ${trend === 'UPTREND' ? 'haussière' : 'en cours'}`]);
  } else if (score >= 58 && bullishSignals >= 2) {
    actionType = 'BUY';
    timing = 'THIS_WEEK';
    confidence = Math.min(80, score + bullishSignals * 2);
    targetPrice = currentPrice + atr * 2;
    stopLoss = currentPrice - atr * 1.5;
    reason = buildReason('Achat modéré.', ['Attendre un léger repli pour optimiser l\'entrée', `Score ${score}/100`]);
  } else if (score <= 25 && bearishSignals >= 4) {
    actionType = 'SELL';
    timing = 'IMMEDIATE';
    confidence = Math.min(95, (100 - score) + bearishSignals * 3);
    targetPrice = Math.min(currentPrice - atr * 3, pivots.support);
    stopLoss = currentPrice + atr * 1.5;
    reason = buildReason('VENTE IMMÉDIATE recommandée.', [`${bearishSignals} signaux baissiers convergent`, `RSI ${rsi.toFixed(0)}`]);
  } else if (score <= 35 && bearishSignals >= 3) {
    actionType = 'SELL';
    timing = 'IMMEDIATE';
    confidence = Math.min(85, (100 - score) + bearishSignals * 2);
    targetPrice = currentPrice - atr * 2;
    stopLoss = currentPrice + atr * 1.5;
    reason = buildReason('Signal de vente.', [`Signaux baissiers dominants`, `Protéger avec stop à ${(currentPrice + atr * 1.5).toFixed(2)}€`]);
  } else if (score <= 42 && bearishSignals >= 2) {
    actionType = 'SELL';
    timing = 'THIS_WEEK';
    confidence = Math.min(75, (100 - score) + bearishSignals * 2);
    targetPrice = currentPrice - atr * 2;
    stopLoss = currentPrice + atr * 1.5;
    reason = buildReason('Alléger les positions.', ['Tendance baissière', 'Risque de continuation à la baisse']);
  } else if (score >= 55 && trend === 'UPTREND') {
    actionType = 'BUY';
    timing = 'WATCH';
    confidence = Math.min(65, score);
    targetPrice = currentPrice + atr * 2;
    stopLoss = currentPrice - atr * 2;
    reason = buildReason('Tendance haussière.', ['Surveiller pour point d\'entrée sur repli', `Support à ${pivots.support.toFixed(2)}€`]);
  } else if (score <= 45 && trend === 'DOWNTREND') {
    actionType = 'SELL';
    timing = 'WATCH';
    confidence = Math.min(65, 100 - score);
    targetPrice = currentPrice - atr * 2;
    stopLoss = currentPrice + atr * 2;
    reason = buildReason('Tendance baissière.', ['Éviter d\'acheter', 'Attendre un retournement confirmé']);
  } else {
    actionType = 'HOLD';
    timing = 'WAIT';
    confidence = 35;
    targetPrice = currentPrice;
    stopLoss = currentPrice - atr * 2;
    reason = 'Pas de signal clair. Marché indécis, attendre une configuration plus nette.';
  }

  const potentialGain = currentPrice > 0 ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0;
  const potentialLoss = currentPrice > 0 ? ((stopLoss - currentPrice) / currentPrice) * 100 : 0;
  const riskReward = potentialLoss !== 0 ? Math.abs(potentialGain / potentialLoss) : 0;

  return {
    ticker, name, sector,
    price: currentPrice,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    scoring,
    action: {
      type: actionType, timing, confidence, reason,
      targetPrice, stopLoss,
      potentialGain, potentialLoss: Math.abs(potentialLoss), riskReward,
    },
    technicals: {
      trend, strength, volatility,
      support: pivots.support,
      resistance: pivots.resistance,
      rsi, macdSignal: macdSignalType, bbPosition: bbPos,
      stochK, stochD, volumeRatio,
    },
  };
}

function getRecommendation(score: number): Recommendation {
  if (score >= 75) return 'STRONG_BUY';
  if (score >= 60) return 'BUY';
  if (score >= 40) return 'HOLD';
  if (score >= 25) return 'SELL';
  return 'STRONG_SELL';
}
