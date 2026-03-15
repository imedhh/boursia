import { useState } from 'react';
import { Briefcase, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { mockPortfolio } from '../stores/mockData';
import PortfolioTable from '../components/portfolio/PortfolioTable';
import PortfolioChart from '../components/portfolio/PortfolioChart';
import AddPositionModal from '../components/portfolio/AddPositionModal';

export default function PortfolioPage() {
  const [showModal, setShowModal] = useState(false);
  const pf = mockPortfolio;
  const isPositive = pf.totalPnl >= 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-accent" />
            Mon Portefeuille
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">{pf.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <p className="text-xs text-text-secondary mb-1">Valeur totale</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {pf.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-xs sm:text-sm text-text-secondary">EUR</span>
          </p>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <p className="text-xs text-text-secondary mb-1">Plus-value latente</p>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-xl sm:text-2xl font-bold">
              {isPositive ? '+' : ''}{pf.totalPnl.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm">EUR</span>
          </div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <p className="text-xs text-text-secondary mb-1">Performance</p>
          <span className={`text-xl sm:text-2xl font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : ''}{pf.totalPnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <PortfolioChart />
      <PortfolioTable positions={pf.positions} />

      <AddPositionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
