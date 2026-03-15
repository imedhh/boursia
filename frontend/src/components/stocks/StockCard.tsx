import { useNavigate } from 'react-router-dom';
import type { Stock } from '../../api/stocks';
import Badge from '../common/Badge';

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const navigate = useNavigate();
  const isPositive = stock.change >= 0;

  // Mini sparkline SVG
  const sparkline = stock.sparkline.length > 1 ? stock.sparkline : [stock.price, stock.price];
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const points = sparkline
    .map((v, i) => `${(i / (sparkline.length - 1)) * width},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <div
      onClick={() => navigate(`/stock/${stock.ticker}`)}
      className="bg-bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
            {stock.name}
          </h4>
          <p className="text-xs text-text-secondary">{stock.ticker}</p>
        </div>
        <Badge label={stock.recommendation} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-lg font-bold text-white">{stock.price.toFixed(2)}</span>
          <span className="text-xs text-text-secondary ml-1">EUR</span>
          <div className={`text-sm font-mono mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>
        <svg width={width} height={height} className="flex-shrink-0">
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
