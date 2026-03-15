import type { Stock } from '../../api/stocks';

interface TechnicalIndicatorsProps {
  stock: Stock;
}

function Gauge({ label, value, min, max, unit }: { label: string; value: number; min: number; max: number; unit?: string }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const color =
    pct > 70 ? 'bg-negative' :
    pct > 60 ? 'bg-warning' :
    pct > 40 ? 'bg-positive' :
    pct > 30 ? 'bg-warning' :
    'bg-negative';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-mono">{value.toFixed(2)}{unit}</span>
      </div>
      <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TechnicalIndicators({ stock }: TechnicalIndicatorsProps) {
  const rsiSignal = stock.rsi > 70 ? 'Suracheté' : stock.rsi < 30 ? 'Survendu' : 'Neutre';
  const rsiColor = stock.rsi > 70 ? 'text-negative' : stock.rsi < 30 ? 'text-positive' : 'text-warning';
  const macdSignal = stock.macd > stock.macdSignal ? 'Haussier' : 'Baissier';
  const macdColor = stock.macd > stock.macdSignal ? 'text-positive' : 'text-negative';

  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Indicateurs techniques</h3>
      <div className="space-y-4">
        {/* RSI */}
        <div>
          <Gauge label="RSI (14)" value={stock.rsi} min={0} max={100} />
          <span className={`text-xs font-medium mt-1 inline-block ${rsiColor}`}>{rsiSignal}</span>
        </div>

        {/* MACD */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">MACD</span>
            <span className={`font-medium ${macdColor}`}>{macdSignal}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between bg-bg-primary rounded px-2 py-1">
              <span className="text-text-secondary">MACD</span>
              <span className="text-text-primary font-mono">{stock.macd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-bg-primary rounded px-2 py-1">
              <span className="text-text-secondary">Signal</span>
              <span className="text-text-primary font-mono">{stock.macdSignal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bollinger */}
        <div>
          <p className="text-xs text-text-secondary mb-1">Bandes de Bollinger</p>
          <div className="relative h-8 bg-bg-primary rounded flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-text-secondary">{stock.bollingerLower.toFixed(0)}</div>
            <div className="absolute right-2 text-[10px] text-text-secondary">{stock.bollingerUpper.toFixed(0)}</div>
            <div
              className="absolute w-2 h-4 bg-accent rounded"
              style={{
                left: `${((stock.price - stock.bollingerLower) / (stock.bollingerUpper - stock.bollingerLower)) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-secondary mt-0.5">
            <span>Bande inf.</span>
            <span className="text-accent font-mono">{stock.price.toFixed(2)}</span>
            <span>Bande sup.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
