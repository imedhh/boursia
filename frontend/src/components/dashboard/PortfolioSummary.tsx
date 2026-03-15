import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { mockPortfolio } from '../../stores/mockData';

export default function PortfolioSummary() {
  const pf = mockPortfolio;
  const isPositive = pf.totalPnl >= 0;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-secondary text-sm font-medium">Mon Portefeuille</h3>
        <Wallet size={18} className="text-accent" />
      </div>
      <div className="mb-3">
        <span className="text-3xl font-bold text-white">
          {pf.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-text-secondary">Plus-value latente</p>
          <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <ArrowUpRight size={14} />}
            <span className="text-sm font-semibold">
              {isPositive ? '+' : ''}{pf.totalPnl.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Performance</p>
          <span className={`text-sm font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : ''}{pf.totalPnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-text-secondary">{pf.positions.length} positions actives</p>
      </div>
    </div>
  );
}
