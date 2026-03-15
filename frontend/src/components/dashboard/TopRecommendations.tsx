import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';
import Badge from '../common/Badge';

export default function TopRecommendations() {
  const navigate = useNavigate();
  const { stocks } = useMarketStore();
  const topStocks = [...stocks]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-secondary text-sm font-medium">Top Recommandations IA</h3>
        <Star size={18} className="text-warning" />
      </div>
      <div className="space-y-3">
        {topStocks.map((stock, index) => (
          <button
            key={stock.ticker}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-hover transition-colors text-left"
          >
            <span className="w-6 h-6 bg-accent/15 text-accent rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary truncate">{stock.name}</span>
                <Badge label={stock.recommendation} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">{stock.ticker}</span>
                <span className={`text-xs font-mono ${stock.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-accent">{stock.aiScore}</div>
              <div className="text-xs text-text-secondary">Score IA</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
