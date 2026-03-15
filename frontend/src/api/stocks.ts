import client from './client';

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  high52w: number;
  low52w: number;
  aiScore: number;
  recommendation: 'Acheter' | 'Conserver' | 'Vendre';
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerUpper: number;
  bollingerLower: number;
  sparkline: number[];
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const getStocks = () => client.get<Stock[]>('/stocks');
export const getStock = (ticker: string) => client.get<Stock>(`/stocks/${ticker}`);
export const getStockHistory = (ticker: string) => client.get<StockHistory[]>(`/stocks/${ticker}/history`);
