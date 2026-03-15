import { useNavigate } from 'react-router-dom';
import { useMarketStore } from '../../stores/marketStore';

export default function MarketHeatmap() {
  const navigate = useNavigate();
  const { stocks } = useMarketStore();

  const getColor = (change: number) => {
    if (change > 2) return 'bg-positive/80 hover:bg-positive/90';
    if (change > 0) return 'bg-positive/40 hover:bg-positive/50';
    if (change > -2) return 'bg-negative/40 hover:bg-negative/50';
    return 'bg-negative/80 hover:bg-negative/90';
  };

  const sorted = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  return (
    <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-5">
      <h3 className="text-text-secondary text-sm font-medium mb-3 sm:mb-4">Carte du marché</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-1 auto-rows-[42px] sm:auto-rows-[48px]">
        {sorted.slice(0, 20).map((stock) => (
          <button
            key={stock.ticker}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className={`${getColor(stock.changePercent)} rounded flex flex-col items-center justify-center transition-colors cursor-pointer`}
          >
            <span className="text-[10px] font-bold text-white leading-tight">
              {stock.ticker.replace('.PA', '')}
            </span>
            <span className="text-[9px] text-white/80">
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
