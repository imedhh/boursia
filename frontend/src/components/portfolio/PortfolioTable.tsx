import { useNavigate } from 'react-router-dom';
import type { Position } from '../../api/portfolio';

interface PortfolioTableProps {
  positions: Position[];
}

export default function PortfolioTable({ positions }: PortfolioTableProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-secondary">Mes positions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              {['Action', 'Qté', 'PRU', 'Cours', 'P&L %'].map((h) => (
                <th key={h} className="px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-text-secondary text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const isPositive = pos.pnl >= 0;
              return (
                <tr
                  key={pos.id}
                  onClick={() => navigate(`/stock/${pos.ticker}`)}
                  className="border-b border-border/50 hover:bg-bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-xs sm:text-sm font-medium text-text-primary">{pos.name}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-text-primary">{pos.quantity}</td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-mono text-text-secondary">{pos.buyPrice.toFixed(2)}</td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-mono text-text-primary">{pos.currentPrice.toFixed(2)}</td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3">
                    <span className={`text-xs sm:text-sm font-mono font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
