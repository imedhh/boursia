import axios from 'axios';
import { CAC40_STOCKS, YAHOO_FINANCE_BASE_URL, CAC40Stock } from '../config/constants';
import redis from '../config/redis';

export interface QuoteData {
  ticker: string;
  yahooTicker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface OHLCVData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function findStock(ticker: string): CAC40Stock | undefined {
  return CAC40_STOCKS.find(
    (s) => s.ticker === ticker || s.yahooTicker === ticker || s.yahooTicker === `${ticker}.PA`
  );
}

export async function fetchQuote(ticker: string): Promise<QuoteData> {
  const stock = findStock(ticker);
  if (!stock) {
    throw new Error(`Ticker ${ticker} not found in CAC 40 list`);
  }

  // Check cache first (60 second TTL)
  const cacheKey = `quote:${stock.yahooTicker}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached);
  }

  const url = `${YAHOO_FINANCE_BASE_URL}/${stock.yahooTicker}?range=1d&interval=5m`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 10000,
  });

  const result = response.data.chart.result[0];
  const meta = result.meta;
  const quotes = result.indicators.quote[0];
  const lastIndex = quotes.close.length - 1;

  const quoteData: QuoteData = {
    ticker: stock.ticker,
    yahooTicker: stock.yahooTicker,
    name: stock.name,
    sector: stock.sector,
    price: meta.regularMarketPrice,
    change: meta.regularMarketPrice - meta.chartPreviousClose,
    changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    volume: meta.regularMarketVolume || 0,
    high: meta.regularMarketDayHigh || quotes.high[lastIndex] || 0,
    low: meta.regularMarketDayLow || quotes.low[lastIndex] || 0,
    open: meta.regularMarketOpen || quotes.open[0] || 0,
    previousClose: meta.chartPreviousClose,
    timestamp: Date.now(),
  };

  // Cache for 60 seconds
  await redis.set(cacheKey, JSON.stringify(quoteData), 'EX', 60).catch(() => {});

  return quoteData;
}

export async function fetchHistorical(
  ticker: string,
  period: string = '6mo',
  interval: string = '1d'
): Promise<OHLCVData[]> {
  const stock = findStock(ticker);
  if (!stock) {
    throw new Error(`Ticker ${ticker} not found in CAC 40 list`);
  }

  const cacheKey = `history:${stock.yahooTicker}:${period}:${interval}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached);
  }

  const url = `${YAHOO_FINANCE_BASE_URL}/${stock.yahooTicker}?range=${period}&interval=${interval}`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 15000,
  });

  const result = response.data.chart.result[0];
  const timestamps: number[] = result.timestamp;
  const quotes = result.indicators.quote[0];

  const ohlcvData: OHLCVData[] = timestamps.map((ts: number, i: number) => ({
    date: new Date(ts * 1000),
    open: quotes.open[i] ?? 0,
    high: quotes.high[i] ?? 0,
    low: quotes.low[i] ?? 0,
    close: quotes.close[i] ?? 0,
    volume: quotes.volume[i] ?? 0,
  })).filter((d: OHLCVData) => d.close > 0);

  // Cache historical data for 5 minutes
  await redis.set(cacheKey, JSON.stringify(ohlcvData), 'EX', 300).catch(() => {});

  return ohlcvData;
}

export async function fetchAllCAC40Quotes(): Promise<QuoteData[]> {
  const promises = CAC40_STOCKS.map((stock) =>
    fetchQuote(stock.ticker).catch((err) => {
      console.error(`[MarketData] Failed to fetch ${stock.yahooTicker}:`, err.message);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter((q): q is QuoteData => q !== null);
}

export function getCAC40List(): CAC40Stock[] {
  return CAC40_STOCKS;
}
