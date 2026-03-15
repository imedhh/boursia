import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';

export default function MarketOverview() {
  const { stocks } = useMarketStore();

  // Calculate aggregate CAC 40 metrics from individual stocks
  const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
  const avgChange = stocks.length > 0
    ? stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length
    : 0;
  const gainers = stocks.filter((s) => s.changePercent > 0).length;
  const losers = stocks.filter((s) => s.changePercent < 0).length;

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} Mds`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)} M`;
    return v.toLocaleString('fr-FR');
  };

  const isPositive = avgChange >= 0;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-secondary text-sm font-medium">Marché CAC 40</h3>
        <Activity size={18} className="text-accent" />
      </div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-bold text-white">{stocks.length}</span>
        <span className="text-sm text-text-secondary">actions suivies</span>
      </div>
      <div className={`flex items-center gap-1 mb-3 ${isPositive ? 'text-positive' : 'text-negative'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="text-sm font-semibold">
          Variation moy. : {isPositive ? '+' : ''}{avgChange.toFixed(2)}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-text-secondary">Volume total</p>
          <p className="text-sm font-medium text-text-primary">{formatVolume(totalVolume)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Haussiers</p>
          <p className="text-sm font-medium text-positive">{gainers}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Baissiers</p>
          <p className="text-sm font-medium text-negative">{losers}</p>
        </div>
      </div>
    </div>
  );
}
