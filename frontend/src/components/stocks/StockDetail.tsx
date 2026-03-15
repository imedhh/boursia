import { useEffect, useState } from 'react';
import {
  ArrowLeft, TrendingUp, TrendingDown,
  Zap, Clock, Eye, MinusCircle, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketStore } from '../../stores/marketStore';
import StockChart from './StockChart';
import ScoreGauge from './ScoreGauge';
import LoadingSpinner from '../common/LoadingSpinner';
import client from '../../api/client';

interface StockDetailProps {
  ticker: string;
}

interface FullAnalysis {
  scoring: {
    globalScore: number;
    technicalScore: number;
    recommendation: string;
    signals: { indicator: string; value: number; signal: string; weight: number; description: string }[];
  };
  action: {
    type: string;
    timing: string;
    confidence: number;
    reason: string;
    targetPrice: number;
    stopLoss: number;
    potentialGain: number;
    potentialLoss: number;
    riskReward: number;
  };
  technicals: {
    trend: string;
    strength: string;
    volatility: string;
    support: number;
    resistance: number;
    rsi: number;
    macdSignal: string;
    bbPosition: number;
    stochK: number;
    stochD: number;
    volumeRatio: number;
  };
}

const timingConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Zap }> = {
  IMMEDIATE: { label: 'Maintenant', color: 'text-positive', bgColor: 'bg-positive/15 border-positive/30', icon: Zap },
  THIS_WEEK: { label: 'Cette semaine', color: 'text-accent', bgColor: 'bg-accent/15 border-accent/30', icon: Clock },
  WATCH: { label: 'Surveiller', color: 'text-warning', bgColor: 'bg-warning/15 border-warning/30', icon: Eye },
  WAIT: { label: 'Attendre', color: 'text-text-secondary', bgColor: 'bg-bg-hover border-border', icon: MinusCircle },
};

const recLabels: Record<string, string> = {
  STRONG_BUY: 'Achat fort', BUY: 'Acheter', HOLD: 'Conserver', SELL: 'Vendre', STRONG_SELL: 'Vente forte',
};

export default function StockDetail({ ticker }: StockDetailProps) {
  const navigate = useNavigate();
  const { selectedStock, stockHistory, loading, selectStock } = useMarketStore();
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [, setAnalysisLoading] = useState(false);

  useEffect(() => {
    selectStock(ticker);
    loadAnalysis();
  }, [ticker]);

  const loadAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const res = await client.get('/stocks/analysis');
      const stockAnalysis = res.data.all.find((a: any) => a.ticker === ticker);
      if (stockAnalysis) {
        setAnalysis({
          scoring: stockAnalysis.scoring,
          action: stockAnalysis.action,
          technicals: stockAnalysis.technicals,
        });
      }
    } catch { /* use store data as fallback */ }
    setAnalysisLoading(false);
  };

  if (loading || !selectedStock) return <LoadingSpinner />;

  const stock = selectedStock;
  const isPositive = stock.change >= 0;
  const score = analysis?.scoring.globalScore ?? stock.aiScore;
  const timing = analysis ? timingConfig[analysis.action.timing] || timingConfig.WAIT : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-xs mb-2 transition-colors">
          <ArrowLeft size={14} /> Retour
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">{stock.name}</h1>
              <span className="text-[10px] text-text-secondary bg-bg-hover px-1.5 py-0.5 rounded">{stock.ticker}</span>
              {analysis && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  score >= 65 ? 'bg-positive/15 text-positive' : score >= 45 ? 'bg-warning/15 text-warning' : 'bg-negative/15 text-negative'
                }`}>{recLabels[analysis.scoring.recommendation] || analysis.scoring.recommendation}</span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{stock.sector}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-white">{stock.price.toFixed(2)} <span className="text-xs text-text-secondary">EUR</span></div>
            <div className={`flex items-center sm:justify-end gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-semibold">{isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Card - the most important part */}
      {analysis && timing && (
        <div className={`rounded-xl border p-4 sm:p-5 ${
          analysis.action.type === 'BUY' ? 'bg-positive/5 border-positive/30' :
          analysis.action.type === 'SELL' ? 'bg-negative/5 border-negative/30' :
          'bg-bg-card border-border'
        }`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base font-bold ${
              score >= 65 ? 'bg-positive/20 text-positive' : score >= 45 ? 'bg-warning/20 text-warning' : 'bg-negative/20 text-negative'
            }`}>{score}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-sm sm:text-base font-bold ${
                  analysis.action.type === 'BUY' ? 'text-positive' : analysis.action.type === 'SELL' ? 'text-negative' : 'text-warning'
                }`}>
                  {analysis.action.type === 'BUY' ? 'ACHETER' : analysis.action.type === 'SELL' ? 'VENDRE' : 'ATTENDRE'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${timing.bgColor} ${timing.color}`}>
                  <timing.icon size={10} />
                  {timing.label}
                </span>
                <span className="text-[10px] text-text-secondary">Confiance : {analysis.action.confidence}%</span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{analysis.action.reason}</p>

              {analysis.action.type !== 'HOLD' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
                  {analysis.action.type === 'BUY' && (
                    <>
                      <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                        <p className="text-[9px] text-text-secondary">Objectif</p>
                        <p className="text-sm font-bold text-positive">{analysis.action.targetPrice.toFixed(2)}€</p>
                        <p className="text-[9px] text-positive">+{analysis.action.potentialGain.toFixed(1)}%</p>
                      </div>
                      <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                        <p className="text-[9px] text-text-secondary">Stop Loss</p>
                        <p className="text-sm font-bold text-negative">{analysis.action.stopLoss.toFixed(2)}€</p>
                        <p className="text-[9px] text-negative">-{analysis.action.potentialLoss.toFixed(1)}%</p>
                      </div>
                      <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                        <p className="text-[9px] text-text-secondary">Risk/Reward</p>
                        <p className="text-sm font-bold text-accent">{analysis.action.riskReward.toFixed(1)}x</p>
                        <p className="text-[9px] text-text-secondary">{analysis.action.riskReward >= 2 ? 'Excellent' : analysis.action.riskReward >= 1.5 ? 'Bon' : 'Acceptable'}</p>
                      </div>
                    </>
                  )}
                  {analysis.action.type === 'SELL' && (
                    <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                      <p className="text-[9px] text-text-secondary">Stop Loss</p>
                      <p className="text-sm font-bold text-negative">{analysis.action.stopLoss.toFixed(2)}€</p>
                    </div>
                  )}
                  <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                    <p className="text-[9px] text-text-secondary">Support</p>
                    <p className="text-sm font-bold text-text-primary">{analysis.technicals.support.toFixed(2)}€</p>
                  </div>
                  <div className="bg-bg-card/50 rounded-lg p-2 border border-border/50">
                    <p className="text-[9px] text-text-secondary">Résistance</p>
                    <p className="text-sm font-bold text-text-primary">{analysis.technicals.resistance.toFixed(2)}€</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart + Technicals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <h3 className="text-xs font-medium text-text-secondary mb-3">Graphique 6 mois</h3>
          <StockChart data={stockHistory} />
        </div>

        {/* Technical Summary */}
        <div className="space-y-3">
          {/* Score Gauge */}
          <div className="bg-bg-card rounded-xl border border-border p-4 flex flex-col items-center">
            <h3 className="text-xs font-medium text-text-secondary mb-2">Score Technique</h3>
            <ScoreGauge score={score} />
          </div>

          {/* Key Indicators */}
          <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
            <h3 className="text-xs font-medium text-text-secondary mb-3">Indicateurs clés</h3>
            <div className="space-y-2">
              {analysis && (
                <>
                  <IndicatorRow label="Tendance" value={analysis.technicals.trend === 'UPTREND' ? 'Haussière' : analysis.technicals.trend === 'DOWNTREND' ? 'Baissière' : 'Neutre'}
                    color={analysis.technicals.trend === 'UPTREND' ? 'text-positive' : analysis.technicals.trend === 'DOWNTREND' ? 'text-negative' : 'text-warning'} />
                  <IndicatorRow label="Force" value={analysis.technicals.strength === 'STRONG' ? 'Forte' : analysis.technicals.strength === 'MODERATE' ? 'Modérée' : 'Faible'}
                    color={analysis.technicals.strength === 'STRONG' ? 'text-positive' : 'text-warning'} />
                  <IndicatorRow label="Volatilité" value={analysis.technicals.volatility === 'HIGH' ? 'Élevée' : analysis.technicals.volatility === 'MEDIUM' ? 'Moyenne' : 'Faible'}
                    color={analysis.technicals.volatility === 'HIGH' ? 'text-negative' : 'text-text-primary'} />
                  <IndicatorRow label="RSI (14)" value={analysis.technicals.rsi.toFixed(1)}
                    color={analysis.technicals.rsi < 30 ? 'text-positive' : analysis.technicals.rsi > 70 ? 'text-negative' : 'text-text-primary'} />
                  <IndicatorRow label="Stochastique" value={`${analysis.technicals.stochK.toFixed(0)} / ${analysis.technicals.stochD.toFixed(0)}`}
                    color={analysis.technicals.stochK < 20 ? 'text-positive' : analysis.technicals.stochK > 80 ? 'text-negative' : 'text-text-primary'} />
                  <IndicatorRow label="Bollinger" value={`${analysis.technicals.bbPosition.toFixed(0)}%`}
                    color={analysis.technicals.bbPosition < 25 ? 'text-positive' : analysis.technicals.bbPosition > 75 ? 'text-negative' : 'text-text-primary'} />
                  <IndicatorRow label="Volume" value={`x${analysis.technicals.volumeRatio.toFixed(1)}`}
                    color={analysis.technicals.volumeRatio > 1.5 ? 'text-accent' : 'text-text-primary'} />
                </>
              )}
              {!analysis && (
                <>
                  <IndicatorRow label="RSI (14)" value={stock.rsi.toFixed(1)}
                    color={stock.rsi < 30 ? 'text-positive' : stock.rsi > 70 ? 'text-negative' : 'text-text-primary'} />
                  <IndicatorRow label="MACD" value={stock.macd.toFixed(2)} color={stock.macd > stock.macdSignal ? 'text-positive' : 'text-negative'} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Detail */}
      {analysis && analysis.scoring.signals.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <h3 className="text-xs font-medium text-text-secondary mb-3 flex items-center gap-2">
            <Activity size={14} />
            Signaux détaillés ({analysis.scoring.signals.length})
          </h3>
          <div className="space-y-2">
            {analysis.scoring.signals
              .sort((a, b) => b.weight - a.weight)
              .map((signal, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/30 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  signal.signal === 'bullish' ? 'bg-positive' : signal.signal === 'bearish' ? 'bg-negative' : 'bg-warning'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-primary">{signal.indicator}</span>
                    <span className="text-[9px] text-text-secondary">Poids: {signal.weight}%</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5">{signal.description}</p>
                </div>
                <span className={`text-[10px] font-medium flex-shrink-0 ${
                  signal.signal === 'bullish' ? 'text-positive' : signal.signal === 'bearish' ? 'text-negative' : 'text-warning'
                }`}>
                  {signal.signal === 'bullish' ? 'Haussier' : signal.signal === 'bearish' ? 'Baissier' : 'Neutre'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
        <h3 className="text-xs font-medium text-text-secondary mb-3">Données de marché</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricItem label="Volume" value={stock.volume > 1000000 ? `${(stock.volume / 1000000).toFixed(1)}M` : `${(stock.volume / 1000).toFixed(0)}K`} />
          <MetricItem label="Plus haut" value={`${stock.high52w > 0 ? stock.high52w.toFixed(2) : '—'} €`} />
          <MetricItem label="Plus bas" value={`${stock.low52w > 0 ? stock.low52w.toFixed(2) : '—'} €`} />
          <MetricItem label="RSI (14)" value={stock.rsi.toFixed(1)} />
          <MetricItem label="MACD" value={stock.macd.toFixed(2)} />
          <MetricItem label="Score IA" value={`${score}/100`} />
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center text-xs py-1 border-b border-border/30 last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-text-secondary">{label}</p>
      <p className="text-xs font-medium text-text-primary mt-0.5">{value}</p>
    </div>
  );
}
