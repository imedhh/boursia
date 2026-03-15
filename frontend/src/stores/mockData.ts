import type { Stock, StockHistory } from '../api/stocks';
import type { Portfolio } from '../api/portfolio';

const sparkline = (base: number, n = 20): number[] => {
  const arr: number[] = [base];
  for (let i = 1; i < n; i++) {
    arr.push(arr[i - 1] + (Math.random() - 0.48) * base * 0.015);
  }
  return arr;
};

export const mockStocks: Stock[] = [
  { ticker: 'AI.PA', name: 'Air Liquide', sector: 'Chimie', price: 178.45, change: 2.35, changePercent: 1.33, volume: 1245000, marketCap: 92400, pe: 28.5, dividend: 2.1, high52w: 185.20, low52w: 142.30, aiScore: 82, recommendation: 'Acheter', rsi: 58, macd: 1.2, macdSignal: 0.8, bollingerUpper: 182.50, bollingerLower: 170.20, sparkline: sparkline(178) },
  { ticker: 'BNP.PA', name: 'BNP Paribas', sector: 'Banque', price: 62.18, change: -0.82, changePercent: -1.30, volume: 3420000, marketCap: 74200, pe: 7.2, dividend: 6.8, high52w: 68.50, low52w: 48.20, aiScore: 71, recommendation: 'Acheter', rsi: 45, macd: -0.3, macdSignal: -0.1, bollingerUpper: 65.00, bollingerLower: 58.50, sparkline: sparkline(62) },
  { ticker: 'MC.PA', name: 'LVMH', sector: 'Luxe', price: 734.20, change: 12.40, changePercent: 1.72, volume: 890000, marketCap: 368000, pe: 24.8, dividend: 1.7, high52w: 780.00, low52w: 620.00, aiScore: 88, recommendation: 'Acheter', rsi: 62, macd: 5.8, macdSignal: 3.2, bollingerUpper: 750.00, bollingerLower: 710.00, sparkline: sparkline(734) },
  { ticker: 'SAN.PA', name: 'Sanofi', sector: 'Santé', price: 92.56, change: -0.44, changePercent: -0.47, volume: 2100000, marketCap: 117000, pe: 14.2, dividend: 3.8, high52w: 104.50, low52w: 82.10, aiScore: 65, recommendation: 'Conserver', rsi: 42, macd: -0.8, macdSignal: -0.5, bollingerUpper: 96.00, bollingerLower: 88.00, sparkline: sparkline(92) },
  { ticker: 'TTE.PA', name: 'TotalEnergies', sector: 'Énergie', price: 58.92, change: 0.78, changePercent: 1.34, volume: 5600000, marketCap: 142000, pe: 8.5, dividend: 5.2, high52w: 65.80, low52w: 49.50, aiScore: 76, recommendation: 'Acheter', rsi: 55, macd: 0.6, macdSignal: 0.3, bollingerUpper: 61.00, bollingerLower: 56.00, sparkline: sparkline(59) },
  { ticker: 'OR.PA', name: "L'Oréal", sector: 'Cosmétiques', price: 412.30, change: -3.70, changePercent: -0.89, volume: 620000, marketCap: 222000, pe: 35.2, dividend: 1.5, high52w: 445.00, low52w: 370.00, aiScore: 73, recommendation: 'Conserver', rsi: 48, macd: -1.5, macdSignal: -0.8, bollingerUpper: 425.00, bollingerLower: 400.00, sparkline: sparkline(412) },
  { ticker: 'SU.PA', name: 'Schneider Electric', sector: 'Industrie', price: 198.45, change: 4.25, changePercent: 2.19, volume: 1050000, marketCap: 112000, pe: 29.8, dividend: 1.8, high52w: 210.00, low52w: 155.00, aiScore: 85, recommendation: 'Acheter', rsi: 64, macd: 3.2, macdSignal: 1.8, bollingerUpper: 205.00, bollingerLower: 188.00, sparkline: sparkline(198) },
  { ticker: 'DG.PA', name: 'Vinci', sector: 'BTP', price: 108.75, change: 0.95, changePercent: 0.88, volume: 1320000, marketCap: 62000, pe: 14.8, dividend: 3.5, high52w: 118.00, low52w: 92.00, aiScore: 69, recommendation: 'Conserver', rsi: 52, macd: 0.4, macdSignal: 0.2, bollingerUpper: 112.00, bollingerLower: 104.00, sparkline: sparkline(108) },
  { ticker: 'SAF.PA', name: 'Safran', sector: 'Aéronautique', price: 215.60, change: 5.80, changePercent: 2.76, volume: 780000, marketCap: 92000, pe: 32.5, dividend: 1.2, high52w: 225.00, low52w: 160.00, aiScore: 91, recommendation: 'Acheter', rsi: 67, macd: 4.5, macdSignal: 2.5, bollingerUpper: 222.00, bollingerLower: 206.00, sparkline: sparkline(215) },
  { ticker: 'CS.PA', name: 'AXA', sector: 'Assurance', price: 33.42, change: 0.18, changePercent: 0.54, volume: 4200000, marketCap: 76000, pe: 10.2, dividend: 5.8, high52w: 36.50, low52w: 27.80, aiScore: 72, recommendation: 'Acheter', rsi: 50, macd: 0.1, macdSignal: 0.05, bollingerUpper: 35.00, bollingerLower: 31.50, sparkline: sparkline(33) },
  { ticker: 'RMS.PA', name: 'Hermès', sector: 'Luxe', price: 2145.00, change: 35.00, changePercent: 1.66, volume: 120000, marketCap: 226000, pe: 52.8, dividend: 0.8, high52w: 2280.00, low52w: 1850.00, aiScore: 79, recommendation: 'Conserver', rsi: 60, macd: 12.5, macdSignal: 8.0, bollingerUpper: 2200.00, bollingerLower: 2050.00, sparkline: sparkline(2145) },
  { ticker: 'EL.PA', name: 'EssilorLuxottica', sector: 'Santé', price: 195.80, change: -1.20, changePercent: -0.61, volume: 540000, marketCap: 88000, pe: 33.5, dividend: 1.4, high52w: 212.00, low52w: 168.00, aiScore: 68, recommendation: 'Conserver', rsi: 44, macd: -0.9, macdSignal: -0.4, bollingerUpper: 202.00, bollingerLower: 190.00, sparkline: sparkline(196) },
  { ticker: 'KER.PA', name: 'Kering', sector: 'Luxe', price: 312.50, change: -8.50, changePercent: -2.65, volume: 680000, marketCap: 38000, pe: 18.5, dividend: 3.2, high52w: 420.00, low52w: 280.00, aiScore: 38, recommendation: 'Vendre', rsi: 32, macd: -5.2, macdSignal: -3.0, bollingerUpper: 340.00, bollingerLower: 295.00, sparkline: sparkline(312) },
  { ticker: 'CA.PA', name: 'Carrefour', sector: 'Distribution', price: 14.28, change: -0.22, changePercent: -1.52, volume: 3800000, marketCap: 10500, pe: 11.5, dividend: 5.5, high52w: 17.80, low52w: 12.50, aiScore: 42, recommendation: 'Vendre', rsi: 35, macd: -0.15, macdSignal: -0.08, bollingerUpper: 15.20, bollingerLower: 13.50, sparkline: sparkline(14) },
  { ticker: 'SGO.PA', name: 'Saint-Gobain', sector: 'Matériaux', price: 78.34, change: 1.56, changePercent: 2.03, volume: 1680000, marketCap: 40200, pe: 12.8, dividend: 3.1, high52w: 82.00, low52w: 58.00, aiScore: 77, recommendation: 'Acheter', rsi: 56, macd: 1.0, macdSignal: 0.5, bollingerUpper: 81.00, bollingerLower: 74.00, sparkline: sparkline(78) },
  { ticker: 'RI.PA', name: 'Pernod Ricard', sector: 'Boissons', price: 128.45, change: -2.15, changePercent: -1.65, volume: 920000, marketCap: 33000, pe: 20.5, dividend: 2.8, high52w: 162.00, low52w: 118.00, aiScore: 45, recommendation: 'Vendre', rsi: 38, macd: -2.1, macdSignal: -1.2, bollingerUpper: 135.00, bollingerLower: 122.00, sparkline: sparkline(128) },
  { ticker: 'BN.PA', name: 'Danone', sector: 'Alimentation', price: 63.82, change: 0.42, changePercent: 0.66, volume: 1540000, marketCap: 43000, pe: 19.2, dividend: 3.4, high52w: 68.00, low52w: 52.00, aiScore: 64, recommendation: 'Conserver', rsi: 49, macd: 0.2, macdSignal: 0.1, bollingerUpper: 66.00, bollingerLower: 61.00, sparkline: sparkline(64) },
  { ticker: 'CAP.PA', name: 'Capgemini', sector: 'Tech', price: 168.20, change: -4.80, changePercent: -2.78, volume: 720000, marketCap: 29000, pe: 17.5, dividend: 2.2, high52w: 210.00, low52w: 152.00, aiScore: 52, recommendation: 'Conserver', rsi: 36, macd: -3.5, macdSignal: -2.0, bollingerUpper: 180.00, bollingerLower: 158.00, sparkline: sparkline(168) },
  { ticker: 'AIR.PA', name: 'Airbus', sector: 'Aéronautique', price: 156.30, change: 3.20, changePercent: 2.09, volume: 1850000, marketCap: 123000, pe: 26.5, dividend: 1.3, high52w: 165.00, low52w: 120.00, aiScore: 83, recommendation: 'Acheter', rsi: 61, macd: 2.8, macdSignal: 1.5, bollingerUpper: 162.00, bollingerLower: 148.00, sparkline: sparkline(156) },
  { ticker: 'STM.PA', name: 'STMicroelectronics', sector: 'Semi-conducteurs', price: 28.45, change: -1.35, changePercent: -4.53, volume: 4500000, marketCap: 25800, pe: 9.8, dividend: 1.0, high52w: 48.00, low52w: 24.50, aiScore: 55, recommendation: 'Conserver', rsi: 30, macd: -1.8, macdSignal: -1.0, bollingerUpper: 32.00, bollingerLower: 26.00, sparkline: sparkline(28) },
  { ticker: 'GLE.PA', name: 'Société Générale', sector: 'Banque', price: 28.92, change: 0.68, changePercent: 2.41, volume: 5200000, marketCap: 23000, pe: 5.8, dividend: 7.2, high52w: 30.50, low52w: 20.00, aiScore: 74, recommendation: 'Acheter', rsi: 57, macd: 0.5, macdSignal: 0.2, bollingerUpper: 30.00, bollingerLower: 27.00, sparkline: sparkline(29) },
  { ticker: 'EN.PA', name: 'Bouygues', sector: 'BTP', price: 34.56, change: 0.24, changePercent: 0.70, volume: 1120000, marketCap: 13200, pe: 10.5, dividend: 5.0, high52w: 38.00, low52w: 28.50, aiScore: 62, recommendation: 'Conserver', rsi: 48, macd: 0.1, macdSignal: 0.05, bollingerUpper: 36.00, bollingerLower: 33.00, sparkline: sparkline(34) },
  { ticker: 'VIV.PA', name: 'Vivendi', sector: 'Média', price: 10.24, change: -0.16, changePercent: -1.54, volume: 2800000, marketCap: 10600, pe: 22.0, dividend: 2.5, high52w: 12.50, low52w: 8.80, aiScore: 40, recommendation: 'Vendre', rsi: 38, macd: -0.12, macdSignal: -0.06, bollingerUpper: 10.80, bollingerLower: 9.60, sparkline: sparkline(10) },
  { ticker: 'ORA.PA', name: 'Orange', sector: 'Télécom', price: 11.85, change: 0.05, changePercent: 0.42, volume: 6200000, marketCap: 31500, pe: 12.8, dividend: 6.5, high52w: 12.80, low52w: 10.20, aiScore: 60, recommendation: 'Conserver', rsi: 46, macd: 0.02, macdSignal: 0.01, bollingerUpper: 12.20, bollingerLower: 11.40, sparkline: sparkline(12) },
  { ticker: 'DSY.PA', name: 'Dassault Systèmes', sector: 'Tech', price: 38.92, change: 0.72, changePercent: 1.88, volume: 1450000, marketCap: 52000, pe: 42.5, dividend: 0.6, high52w: 42.00, low52w: 32.50, aiScore: 70, recommendation: 'Conserver', rsi: 54, macd: 0.5, macdSignal: 0.3, bollingerUpper: 40.50, bollingerLower: 37.00, sparkline: sparkline(39) },
  { ticker: 'PUB.PA', name: 'Publicis', sector: 'Média', price: 105.20, change: 1.80, changePercent: 1.74, volume: 680000, marketCap: 26500, pe: 14.2, dividend: 3.0, high52w: 110.00, low52w: 78.00, aiScore: 78, recommendation: 'Acheter', rsi: 59, macd: 1.5, macdSignal: 0.8, bollingerUpper: 108.00, bollingerLower: 100.00, sparkline: sparkline(105) },
  { ticker: 'LR.PA', name: 'Legrand', sector: 'Industrie', price: 96.48, change: 1.12, changePercent: 1.17, volume: 520000, marketCap: 25600, pe: 25.8, dividend: 2.0, high52w: 102.00, low52w: 78.00, aiScore: 72, recommendation: 'Acheter', rsi: 53, macd: 0.8, macdSignal: 0.4, bollingerUpper: 99.00, bollingerLower: 93.00, sparkline: sparkline(96) },
  { ticker: 'ACA.PA', name: 'Crédit Agricole', sector: 'Banque', price: 14.18, change: 0.32, changePercent: 2.31, volume: 7800000, marketCap: 43200, pe: 6.5, dividend: 8.5, high52w: 15.20, low52w: 10.80, aiScore: 75, recommendation: 'Acheter', rsi: 58, macd: 0.2, macdSignal: 0.1, bollingerUpper: 14.80, bollingerLower: 13.40, sparkline: sparkline(14) },
  { ticker: 'VIE.PA', name: 'Veolia', sector: 'Environnement', price: 29.84, change: 0.46, changePercent: 1.57, volume: 2100000, marketCap: 21300, pe: 18.5, dividend: 3.8, high52w: 32.00, low52w: 24.50, aiScore: 67, recommendation: 'Conserver', rsi: 51, macd: 0.3, macdSignal: 0.15, bollingerUpper: 31.00, bollingerLower: 28.50, sparkline: sparkline(30) },
  { ticker: 'MT.PA', name: 'ArcelorMittal', sector: 'Métallurgie', price: 24.56, change: -0.78, changePercent: -3.08, volume: 3400000, marketCap: 21000, pe: 6.2, dividend: 1.8, high52w: 32.00, low52w: 20.50, aiScore: 48, recommendation: 'Conserver', rsi: 34, macd: -0.6, macdSignal: -0.3, bollingerUpper: 26.50, bollingerLower: 22.80, sparkline: sparkline(25) },
  { ticker: 'URW.PA', name: 'Unibail-Rodamco', sector: 'Immobilier', price: 72.50, change: -1.50, changePercent: -2.03, volume: 850000, marketCap: 10100, pe: 15.8, dividend: 0.0, high52w: 82.00, low52w: 45.00, aiScore: 44, recommendation: 'Vendre', rsi: 37, macd: -1.2, macdSignal: -0.6, bollingerUpper: 78.00, bollingerLower: 68.00, sparkline: sparkline(72) },
  { ticker: 'STLA.PA', name: 'Stellantis', sector: 'Automobile', price: 12.85, change: -0.65, changePercent: -4.81, volume: 8200000, marketCap: 38500, pe: 3.2, dividend: 8.0, high52w: 22.00, low52w: 11.50, aiScore: 35, recommendation: 'Vendre', rsi: 28, macd: -0.8, macdSignal: -0.4, bollingerUpper: 14.50, bollingerLower: 11.80, sparkline: sparkline(13) },
  { ticker: 'ML.PA', name: 'Michelin', sector: 'Automobile', price: 34.28, change: 0.48, changePercent: 1.42, volume: 1650000, marketCap: 24500, pe: 11.2, dividend: 3.6, high52w: 38.00, low52w: 28.00, aiScore: 68, recommendation: 'Conserver', rsi: 50, macd: 0.3, macdSignal: 0.15, bollingerUpper: 36.00, bollingerLower: 32.50, sparkline: sparkline(34) },
  { ticker: 'ATO.PA', name: 'Atos', sector: 'Tech', price: 1.85, change: -0.15, changePercent: -7.50, volume: 12000000, marketCap: 2100, pe: -5.2, dividend: 0.0, high52w: 8.50, low52w: 1.20, aiScore: 15, recommendation: 'Vendre', rsi: 22, macd: -0.25, macdSignal: -0.12, bollingerUpper: 2.40, bollingerLower: 1.50, sparkline: sparkline(2) },
  { ticker: 'TEP.PA', name: 'Teleperformance', sector: 'Services', price: 88.50, change: -3.50, changePercent: -3.80, volume: 580000, marketCap: 15200, pe: 8.5, dividend: 3.2, high52w: 145.00, low52w: 80.00, aiScore: 50, recommendation: 'Conserver', rsi: 33, macd: -2.5, macdSignal: -1.5, bollingerUpper: 96.00, bollingerLower: 82.00, sparkline: sparkline(88) },
  { ticker: 'RNO.PA', name: 'Renault', sector: 'Automobile', price: 48.92, change: 1.08, changePercent: 2.26, volume: 2400000, marketCap: 14500, pe: 4.8, dividend: 4.5, high52w: 52.00, low52w: 34.00, aiScore: 66, recommendation: 'Conserver', rsi: 54, macd: 0.6, macdSignal: 0.3, bollingerUpper: 51.00, bollingerLower: 46.00, sparkline: sparkline(49) },
  { ticker: 'WLN.PA', name: 'Worldline', sector: 'Tech', price: 8.42, change: -0.38, changePercent: -4.32, volume: 3200000, marketCap: 2400, pe: -12.0, dividend: 0.0, high52w: 15.00, low52w: 6.80, aiScore: 28, recommendation: 'Vendre', rsi: 26, macd: -0.5, macdSignal: -0.25, bollingerUpper: 9.80, bollingerLower: 7.50, sparkline: sparkline(8) },
  { ticker: 'ENGI.PA', name: 'Engie', sector: 'Énergie', price: 16.42, change: 0.18, changePercent: 1.11, volume: 5400000, marketCap: 40000, pe: 11.5, dividend: 7.0, high52w: 17.80, low52w: 13.50, aiScore: 70, recommendation: 'Acheter', rsi: 52, macd: 0.1, macdSignal: 0.05, bollingerUpper: 17.00, bollingerLower: 15.80, sparkline: sparkline(16) },
  { ticker: 'TLX.PA', name: 'Thalès', sector: 'Défense', price: 225.80, change: 8.20, changePercent: 3.77, volume: 650000, marketCap: 48000, pe: 22.5, dividend: 1.6, high52w: 240.00, low52w: 145.00, aiScore: 90, recommendation: 'Acheter', rsi: 68, macd: 6.5, macdSignal: 3.5, bollingerUpper: 235.00, bollingerLower: 215.00, sparkline: sparkline(226) },
];

export const generateMockHistory = (stock: Stock, days = 180): StockHistory[] => {
  const history: StockHistory[] = [];
  let price = stock.price * 0.85;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const change = (Math.random() - 0.48) * price * 0.03;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    history.push({
      date: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(stock.volume * (0.7 + Math.random() * 0.6)),
    });
    price = close;
  }
  return history;
};

export const mockPortfolio: Portfolio = {
  id: '1',
  name: 'Mon Portefeuille Principal',
  totalValue: 48520.35,
  totalPnl: 3250.80,
  totalPnlPercent: 7.18,
  positions: [
    { id: '1', ticker: 'MC.PA', name: 'LVMH', quantity: 15, buyPrice: 698.50, currentPrice: 734.20, pnl: 535.50, pnlPercent: 5.11, date: '2024-06-15' },
    { id: '2', ticker: 'AI.PA', name: 'Air Liquide', quantity: 50, buyPrice: 162.30, currentPrice: 178.45, pnl: 807.50, pnlPercent: 9.95, date: '2024-03-20' },
    { id: '3', ticker: 'SAF.PA', name: 'Safran', quantity: 30, buyPrice: 185.20, currentPrice: 215.60, pnl: 912.00, pnlPercent: 16.41, date: '2024-01-10' },
    { id: '4', ticker: 'TTE.PA', name: 'TotalEnergies', quantity: 100, buyPrice: 55.40, currentPrice: 58.92, pnl: 352.00, pnlPercent: 6.35, date: '2024-07-22' },
    { id: '5', ticker: 'KER.PA', name: 'Kering', quantity: 10, buyPrice: 348.00, currentPrice: 312.50, pnl: -355.00, pnlPercent: -10.20, date: '2024-04-18' },
    { id: '6', ticker: 'TLX.PA', name: 'Thalès', quantity: 20, buyPrice: 180.50, currentPrice: 225.80, pnl: 906.00, pnlPercent: 25.07, date: '2023-11-05' },
  ],
};

export const mockPerformanceData = [
  { month: 'Sep', value: 42000 },
  { month: 'Oct', value: 43500 },
  { month: 'Nov', value: 42800 },
  { month: 'Déc', value: 44200 },
  { month: 'Jan', value: 45100 },
  { month: 'Fév', value: 46800 },
  { month: 'Mar', value: 48520 },
];
