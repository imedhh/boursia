import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Stock } from '../../api/stocks';
import Badge from '../common/Badge';

interface StockTableProps {
  stocks: Stock[];
}

type SortKey = 'name' | 'price' | 'changePercent' | 'volume' | 'aiScore' | 'marketCap';
type SortDir = 'asc' | 'desc';

export default function StockTable({ stocks }: StockTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('aiScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [stocks, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-text-secondary" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-accent" /> : <ArrowDown size={12} className="text-accent" />;
  };

  const columns: { key: SortKey; label: string; align?: string; hideOnMobile?: boolean }[] = [
    { key: 'name', label: 'Action' },
    { key: 'price', label: 'Prix', align: 'text-right' },
    { key: 'changePercent', label: 'Var.', align: 'text-right' },
    { key: 'volume', label: 'Volume', align: 'text-right', hideOnMobile: true },
    { key: 'aiScore', label: 'Score', align: 'text-center' },
  ];

  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors ${col.align || 'text-left'} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-text-secondary text-center">Signal</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  className="border-b border-border/50 hover:bg-bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3">
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-text-primary">{stock.name}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-text-secondary">{stock.sector}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                    <span className="text-xs sm:text-sm font-mono text-text-primary">{stock.price.toFixed(2)}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                    <span className={`text-xs sm:text-sm font-mono font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-right hidden sm:table-cell">
                    <span className="text-xs sm:text-sm text-text-secondary">
                      {(stock.volume / 1000000).toFixed(1)}M
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full text-[10px] sm:text-xs font-bold ${
                        stock.aiScore >= 70
                          ? 'bg-positive/15 text-positive'
                          : stock.aiScore >= 50
                          ? 'bg-warning/15 text-warning'
                          : 'bg-negative/15 text-negative'
                      }`}
                    >
                      {stock.aiScore}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                    <Badge label={stock.recommendation} />
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
