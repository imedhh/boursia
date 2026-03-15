import { create } from 'zustand';
import type { Stock, StockHistory } from '../api/stocks';
import { mockStocks, generateMockHistory } from './mockData';
import client from '../api/client';

interface APIStock {
  ticker: string;
  yahooTicker: string;
  name: string;
  sector: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

function generateSparkline(price: number): number[] {
  const arr: number[] = [price * 0.97];
  for (let i = 1; i < 20; i++) {
    arr.push(arr[i - 1] + (Math.random() - 0.48) * price * 0.012);
  }
  arr.push(price);
  return arr;
}

function mapAPIStockToStock(apiStock: APIStock): Stock {
  const price = apiStock.price ?? 0;
  const change = apiStock.change ?? 0;
  const changePercent = apiStock.changePercent ?? 0;

  return {
    ticker: apiStock.ticker,
    name: apiStock.name,
    sector: apiStock.sector,
    price,
    change,
    changePercent,
    volume: apiStock.volume ?? 0,
    marketCap: 0,
    pe: 0,
    dividend: 0,
    high52w: 0,
    low52w: 0,
    aiScore: 50,
    recommendation: changePercent > 1 ? 'Acheter' : changePercent < -1 ? 'Vendre' : 'Conserver',
    rsi: 50,
    macd: 0,
    macdSignal: 0,
    bollingerUpper: price * 1.02,
    bollingerLower: price * 0.98,
    sparkline: generateSparkline(price),
  };
}

interface StockDetail {
  quote: any;
  indicators: {
    rsi: number;
    macd: { macdLine: number; signalLine: number; histogram: number };
    sma20: number;
    sma50: number;
    bollingerBands: { upper: number; middle: number; lower: number };
    atr: number;
    stochastic: { k: number; d: number };
  };
  scoring: {
    technicalScore: number;
    fundamentalScore: number;
    globalScore: number;
    recommendation: string;
    signals: any[];
  };
}

interface MarketState {
  stocks: Stock[];
  selectedStock: Stock | null;
  stockDetail: StockDetail | null;
  stockHistory: StockHistory[];
  loading: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  selectStock: (ticker: string) => void;
  fetchStockDetail: (ticker: string) => Promise<void>;
  fetchStockHistory: (ticker: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  stocks: [],
  selectedStock: null,
  stockDetail: null,
  stockHistory: [],
  loading: false,
  error: null,

  fetchStocks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await client.get('/stocks');
      const data = response.data;
      const stocks: Stock[] = data.stocks
        .filter((s: APIStock) => s.price !== null && s.price > 0)
        .map((s: APIStock) => mapAPIStockToStock(s));
      set({ stocks, loading: false });
    } catch {
      console.warn('[MarketStore] API unavailable, using mock data');
      set({ stocks: mockStocks, loading: false });
    }
  },

  selectStock: (ticker: string) => {
    const clean = ticker.replace('.PA', '').replace('.AS', '');
    const stock = get().stocks.find((s) => {
      const sTicker = s.ticker.replace('.PA', '').replace('.AS', '');
      return sTicker === clean || s.ticker === ticker;
    }) || null;
    set({ selectedStock: stock, stockDetail: null });
    if (stock) {
      get().fetchStockDetail(stock.ticker);
      get().fetchStockHistory(stock.ticker);
    }
  },

  fetchStockDetail: async (ticker: string) => {
    try {
      const response = await client.get(`/stocks/${ticker}`);
      const detail = response.data as StockDetail;
      set({ stockDetail: detail });

      const stock = get().selectedStock;
      if (stock && detail) {
        const recMap: Record<string, 'Acheter' | 'Conserver' | 'Vendre'> = {
          STRONG_BUY: 'Acheter',
          BUY: 'Acheter',
          HOLD: 'Conserver',
          SELL: 'Vendre',
          STRONG_SELL: 'Vendre',
        };
        set({
          selectedStock: {
            ...stock,
            price: detail.quote.price ?? stock.price,
            change: detail.quote.change ?? stock.change,
            changePercent: detail.quote.changePercent ?? stock.changePercent,
            volume: detail.quote.volume ?? stock.volume,
            high52w: detail.quote.high ?? stock.high52w,
            low52w: detail.quote.low ?? stock.low52w,
            rsi: detail.indicators.rsi,
            macd: detail.indicators.macd.macdLine,
            macdSignal: detail.indicators.macd.signalLine,
            bollingerUpper: detail.indicators.bollingerBands.upper,
            bollingerLower: detail.indicators.bollingerBands.lower,
            aiScore: detail.scoring.globalScore,
            recommendation: recMap[detail.scoring.recommendation] || 'Conserver',
          },
        });
      }
    } catch {
      console.warn('[MarketStore] Failed to fetch stock detail for', ticker);
    }
  },

  fetchStockHistory: async (ticker: string) => {
    set({ loading: true });
    try {
      const response = await client.get(`/stocks/${ticker}/history`);
      const data = response.data;
      const history: StockHistory[] = data.data.map((d: any) => ({
        date: new Date(d.date).toISOString().split('T')[0],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }));
      set({ stockHistory: history, loading: false });
    } catch {
      const stock = get().selectedStock;
      if (stock) {
        set({ stockHistory: generateMockHistory(stock), loading: false });
      } else {
        set({ loading: false });
      }
    }
  },
}));
