import client from './client';

export interface Position {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  date: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
}

export interface AddPositionPayload {
  portfolioId: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  date: string;
}

export const getPortfolios = () => client.get<Portfolio[]>('/portfolios');
export const createPortfolio = (name: string) => client.post<Portfolio>('/portfolios', { name });
export const addPosition = (data: AddPositionPayload) =>
  client.post<Position>(`/portfolios/${data.portfolioId}/positions`, data);
export const deletePosition = (portfolioId: string, positionId: string) =>
  client.delete(`/portfolios/${portfolioId}/positions/${positionId}`);
