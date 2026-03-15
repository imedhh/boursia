import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Grid3X3, List, ArrowUp, ArrowDown, ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import client from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface MarketStock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  scoring: { globalScore: number; recommendation: string };
  action: { type: string; timing: string; confidence: number };
  technicals: { trend: string; rsi: number };
}

type ViewMode = 'table' | 'grid';
type SortKey = 'name' | 'price' | 'changePercent' | 'volume' | 'score' | 'confidence';

const recColors: Record<string, string> = {
  STRONG_BUY: 'bg-positive/15 text-positive',
  BUY: 'bg-positive/15 text-positive',
  HOLD: 'bg-warning/15 text-warning',
  SELL: 'bg-negative/15 text-negative',
  STRONG_SELL: 'bg-negative/15 text-negative',
};

const recLabels: Record<string, string> = {
  STRONG_BUY: 'Achat fort',
  BUY: 'Acheter',
  HOLD: 'Conserver',
  SELL: 'Vendre',
  STRONG_SELL: 'Vente forte',
};

const actionColors: Record<string, string> = {
  BUY: 'text-positive',
  SELL: 'text-negative',
  HOLD: 'text-warning',
};

export default function MarketPage() {
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sectorFilter, setSectorFilter] = useState('Tous');
  const [actionFilter, setActionFilter] = useState('Tous');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/stocks/analysis');
      setStocks(res.data.all);
    } catch {
      // Fallback to basic stocks list
      try {
        const res = await client.get('/stocks');
        setStocks(res.data.stocks.filter((s: any) => s.price).map((s: any) => ({
          ...s, scoring: { globalScore: 50, recommendation: 'HOLD' },
          action: { type: 'HOLD', timing: 'WAIT', confidence: 0 },
          technicals: { trend: 'SIDEWAYS', rsi: 50 },
        })));
      } catch { /* empty */ }
    } finally {
      setLoading(false);
    }
  };

  const sectors = ['Tous', ...new Set(stocks.map((s) => s.sector))];

  const filtered = stocks.filter((s) => {
    if (sectorFilter !== 'Tous' && s.sector !== sectorFilter) return false;
    if (actionFilter !== 'Tous' && s.action.type !== actionFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: number | string, bVal: number | string;
    switch (sortKey) {
      case 'name': aVal = a.name; bVal = b.name; break;
      case 'price': aVal = a.price; bVal = b.price; break;
      case 'changePercent': aVal = a.changePercent; bVal = b.changePercent; break;
      case 'volume': aVal = a.volume; bVal = b.volume; break;
      case 'score': aVal = a.scoring.globalScore; bVal = b.scoring.globalScore; break;
      case 'confidence': aVal = a.action.confidence; bVal = b.action.confidence; break;
      default: return 0;
    }
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-accent" />
            Marché CAC 40
          </h1>
          <p className="text-xs text-text-secondary">{filtered.length} actions — données temps réel avec analyse technique</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary'}`}><List size={18} /></button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary'}`}><Grid3X3 size={18} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent">
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {['Tous', 'BUY', 'SELL', 'HOLD'].map((f) => (
          <button key={f} onClick={() => setActionFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${actionFilter === f ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary border border-border'}`}>
            {f === 'Tous' ? 'Tous' : f === 'BUY' ? 'Acheter' : f === 'SELL' ? 'Vendre' : 'Conserver'}
          </button>
        ))}
      </div>

      {viewMode === 'table' ? (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: 'name' as SortKey, label: 'Action', align: 'text-left' },
                    { key: 'price' as SortKey, label: 'Prix', align: 'text-right' },
                    { key: 'changePercent' as SortKey, label: 'Var.', align: 'text-right' },
                    { key: 'volume' as SortKey, label: 'Volume', align: 'text-right', hide: true },
                    { key: 'score' as SortKey, label: 'Score', align: 'text-center' },
                    { key: 'confidence' as SortKey, label: 'Signal', align: 'text-center' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className={`px-2 sm:px-4 py-2.5 text-[10px] sm:text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary ${col.align} ${col.hide ? 'hidden md:table-cell' : ''}`}>
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key ? (sortDir === 'asc' ? <ArrowUp size={12} className="text-accent" /> : <ArrowDown size={12} className="text-accent" />) : <ArrowUpDown size={12} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((stock) => (
                  <tr key={stock.ticker} onClick={() => navigate(`/stock/${stock.ticker}`)} className="border-b border-border/50 hover:bg-bg-hover cursor-pointer transition-colors">
                    <td className="px-2 sm:px-4 py-2.5">
                      <span className="text-xs sm:text-sm font-medium text-text-primary">{stock.name}</span>
                      <br />
                      <span className="text-[10px] text-text-secondary">{stock.sector}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-2.5 text-right text-xs sm:text-sm font-mono text-text-primary">{stock.price.toFixed(2)}€</td>
                    <td className={`px-2 sm:px-4 py-2.5 text-right text-xs sm:text-sm font-mono font-medium ${stock.changePercent >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 sm:px-4 py-2.5 text-right hidden md:table-cell text-xs text-text-secondary">{(stock.volume / 1000000).toFixed(1)}M</td>
                    <td className="px-2 sm:px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] sm:text-xs font-bold ${stock.scoring.globalScore >= 60 ? 'bg-positive/15 text-positive' : stock.scoring.globalScore >= 45 ? 'bg-warning/15 text-warning' : 'bg-negative/15 text-negative'}`}>
                        {stock.scoring.globalScore}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${recColors[stock.scoring.recommendation] || 'bg-bg-hover text-text-secondary'}`}>
                        {stock.action.type === 'BUY' ? <TrendingUp size={10} /> : stock.action.type === 'SELL' ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {recLabels[stock.scoring.recommendation] || stock.scoring.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sorted.map((stock) => (
            <button key={stock.ticker} onClick={() => navigate(`/stock/${stock.ticker}`)} className="bg-bg-card rounded-xl border border-border p-4 text-left hover:border-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-white">{stock.name}</span>
                  <span className="text-[10px] text-text-secondary ml-2">{stock.ticker}</span>
                </div>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${stock.scoring.globalScore >= 60 ? 'bg-positive/15 text-positive' : stock.scoring.globalScore >= 45 ? 'bg-warning/15 text-warning' : 'bg-negative/15 text-negative'}`}>
                  {stock.scoring.globalScore}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-bold text-white">{stock.price.toFixed(2)}€</span>
                  <span className={`ml-2 text-xs font-mono ${stock.changePercent >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <span className={`text-[10px] font-medium ${actionColors[stock.action.type] || 'text-text-secondary'}`}>
                  {stock.action.type === 'BUY' ? 'ACHETER' : stock.action.type === 'SELL' ? 'VENDRE' : 'ATTENDRE'}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary mt-2">{stock.sector} — RSI: {stock.technicals.rsi.toFixed(0)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
