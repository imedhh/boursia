import { Router, Request, Response } from 'express';
import { fetchQuote, fetchHistorical, fetchAllCAC40Quotes, getCAC40List } from '../services/marketData';
import { RSI, MACD, SMA, EMA, BollingerBands, ATR, Stochastic, OBV, VWAP } from '../services/technicalAnalysis';
import { computeScore, computeActionableAnalysis, ActionableAnalysis } from '../services/scoringEngine';
import { AppError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/stocks - List all CAC 40 stocks with current quotes
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const quotes = await fetchAllCAC40Quotes();
    const stockList = getCAC40List();

    res.json({
      count: stockList.length,
      stocks: stockList.map((stock) => {
        const quote = quotes.find((q) => q.ticker === stock.ticker);
        return {
          ...stock,
          price: quote?.price ?? null,
          change: quote?.change ?? null,
          changePercent: quote?.changePercent ?? null,
          volume: quote?.volume ?? null,
        };
      }),
    });
  } catch (error) {
    throw new AppError('Failed to fetch CAC 40 stocks', 500);
  }
});

// GET /api/stocks/analysis - Full market analysis with buy/sell signals
router.get('/analysis', async (_req: Request, res: Response): Promise<void> => {
  try {
    const quotes = await fetchAllCAC40Quotes();
    const stockList = getCAC40List();

    // Process in batches of 5 to avoid Yahoo Finance rate limiting
    const analyses: (ActionableAnalysis | null)[] = [];
    const batchSize = 5;
    for (let i = 0; i < stockList.length; i += batchSize) {
      const batch = stockList.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (stock) => {
          const quote = quotes.find((q) => q.ticker === stock.ticker);
          if (!quote || !quote.price) return null;

          try {
            const historical = await fetchHistorical(stock.ticker, '6mo', '1d');
            if (historical.length < 30) return null;

            return computeActionableAnalysis(
              stock.ticker, stock.name, stock.sector,
              historical,
              { price: quote.price, change: quote.change, changePercent: quote.changePercent, volume: quote.volume }
            );
          } catch {
            return null;
          }
        })
      );
      analyses.push(...batchResults);
      // Small delay between batches
      if (i + batchSize < stockList.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const valid = analyses.filter((a) => a !== null);

    // Sort: IMMEDIATE buys first, then by confidence
    const buySignals = valid
      .filter((a) => a.action.type === 'BUY')
      .sort((a, b) => {
        const timingOrder: Record<string, number> = { IMMEDIATE: 0, THIS_WEEK: 1, WATCH: 2, WAIT: 3 };
        const ta = timingOrder[a.action.timing];
        const tb = timingOrder[b.action.timing];
        if (ta !== tb) return ta - tb;
        return b.action.confidence - a.action.confidence;
      });

    const sellSignals = valid
      .filter((a) => a.action.type === 'SELL')
      .sort((a, b) => {
        const timingOrder: Record<string, number> = { IMMEDIATE: 0, THIS_WEEK: 1, WATCH: 2, WAIT: 3 };
        const ta = timingOrder[a.action.timing];
        const tb = timingOrder[b.action.timing];
        if (ta !== tb) return ta - tb;
        return b.action.confidence - a.action.confidence;
      });

    const holdSignals = valid.filter((a) => a.action.type === 'HOLD');

    // Market sentiment
    const avgScore = valid.reduce((s, a) => s + a.scoring.globalScore, 0) / (valid.length || 1);
    const bullishCount = valid.filter((a) => a.scoring.globalScore >= 60).length;
    const bearishCount = valid.filter((a) => a.scoring.globalScore <= 40).length;

    res.json({
      timestamp: new Date().toISOString(),
      marketSentiment: {
        score: Math.round(avgScore),
        label: avgScore >= 60 ? 'HAUSSIER' : avgScore <= 40 ? 'BAISSIER' : 'NEUTRE',
        bullishStocks: bullishCount,
        bearishStocks: bearishCount,
        neutralStocks: valid.length - bullishCount - bearishCount,
        totalAnalyzed: valid.length,
      },
      topBuys: buySignals.slice(0, 10),
      topSells: sellSignals.slice(0, 10),
      holds: holdSignals,
      all: valid.sort((a, b) => b.scoring.globalScore - a.scoring.globalScore),
    });
  } catch (error) {
    throw new AppError('Failed to compute market analysis', 500);
  }
});

// GET /api/stocks/:ticker - Stock detail with technical indicators
router.get('/:ticker', async (req: Request, res: Response): Promise<void> => {
  const { ticker } = req.params;

  try {
    const [quote, historical] = await Promise.all([
      fetchQuote(ticker),
      fetchHistorical(ticker, '6mo', '1d'),
    ]);

    const closes = historical.map((d) => d.close);

    // Compute technical indicators
    const rsiValues = RSI(closes, 14);
    const macdResult = MACD(closes);
    const sma20 = SMA(closes, 20);
    const sma50 = SMA(closes, Math.min(50, closes.length));
    const ema12 = EMA(closes, 12);
    const ema26 = EMA(closes, 26);
    const bb = BollingerBands(closes, 20, 2);
    const atr = ATR(historical, 14);
    const stoch = Stochastic(historical, 14, 3);
    const obv = OBV(historical);
    const vwap = VWAP(historical);

    // Compute score
    const scoring = computeScore(historical);

    const lastIdx = closes.length - 1;

    res.json({
      quote,
      indicators: {
        rsi: rsiValues[lastIdx],
        macd: {
          macdLine: macdResult.macdLine[lastIdx],
          signalLine: macdResult.signalLine[lastIdx],
          histogram: macdResult.histogram[lastIdx],
        },
        sma20: sma20[lastIdx],
        sma50: sma50[lastIdx],
        ema12: ema12[lastIdx],
        ema26: ema26[lastIdx],
        bollingerBands: {
          upper: bb.upper[lastIdx],
          middle: bb.middle[lastIdx],
          lower: bb.lower[lastIdx],
        },
        atr: atr[lastIdx],
        stochastic: {
          k: stoch.k[lastIdx],
          d: stoch.d[lastIdx],
        },
        obv: obv[lastIdx],
        vwap: vwap[lastIdx],
      },
      scoring,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      throw new AppError(`Ticker ${ticker} not found`, 404);
    }
    throw new AppError(`Failed to fetch data for ${ticker}`, 500);
  }
});

// GET /api/stocks/:ticker/history - Historical data
router.get('/:ticker/history', async (req: Request, res: Response): Promise<void> => {
  const { ticker } = req.params;
  const period = (req.query.period as string) || '6mo';
  const interval = (req.query.interval as string) || '1d';

  const validPeriods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y'];
  const validIntervals = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo'];

  if (!validPeriods.includes(period)) {
    throw new AppError(`Invalid period. Valid values: ${validPeriods.join(', ')}`, 400);
  }

  if (!validIntervals.includes(interval)) {
    throw new AppError(`Invalid interval. Valid values: ${validIntervals.join(', ')}`, 400);
  }

  try {
    const historical = await fetchHistorical(ticker, period, interval);

    res.json({
      ticker,
      period,
      interval,
      count: historical.length,
      data: historical,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      throw new AppError(`Ticker ${ticker} not found`, 404);
    }
    throw new AppError(`Failed to fetch history for ${ticker}`, 500);
  }
});

export default router;
