import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Clock, Zap,
  ArrowUpCircle, ArrowDownCircle, MinusCircle, ChevronRight, Activity,
  Eye, AlertTriangle, ShieldCheck, BarChart3
} from 'lucide-react';
import client from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ActionableStock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  scoring: { globalScore: number; recommendation: string; signals: any[] };
  action: {
    type: 'BUY' | 'SELL' | 'HOLD';
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
  };
}

interface MarketAnalysis {
  timestamp: string;
  marketSentiment: {
    score: number;
    label: string;
    bullishStocks: number;
    bearishStocks: number;
    neutralStocks: number;
    totalAnalyzed: number;
  };
  topBuys: ActionableStock[];
  topSells: ActionableStock[];
  holds: ActionableStock[];
  all: ActionableStock[];
}

const timingConfig: Record<string, { label: string; color: string; icon: typeof Zap }> = {
  IMMEDIATE: { label: 'Maintenant', color: 'text-positive bg-positive/15 border-positive/30', icon: Zap },
  THIS_WEEK: { label: 'Cette semaine', color: 'text-accent bg-accent/15 border-accent/30', icon: Clock },
  WATCH: { label: 'Surveiller', color: 'text-warning bg-warning/15 border-warning/30', icon: Eye },
  WAIT: { label: 'Attendre', color: 'text-text-secondary bg-bg-hover border-border', icon: MinusCircle },
};

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/stocks/analysis');
      setAnalysis(res.data);
    } catch {
      setError('Erreur de chargement. Le marché est peut-être fermé.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="text-sm text-text-secondary mt-4">Analyse des 40 actions en cours...</p>
        <p className="text-xs text-text-secondary mt-1">Calcul RSI, MACD, Bollinger, Momentum...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle size={40} className="text-warning mb-3" />
        <p className="text-text-secondary text-sm">{error}</p>
        <button onClick={loadAnalysis} className="mt-4 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover transition-colors">Réessayer</button>
      </div>
    );
  }

  const sentiment = analysis.marketSentiment;
  const immediateBuys = analysis.topBuys.filter(s => s.action.timing === 'IMMEDIATE');
  const immediateSells = analysis.topSells.filter(s => s.action.timing === 'IMMEDIATE');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-accent" />
            Analyse du Marché
          </h1>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {new Date(analysis.timestamp).toLocaleString('fr-FR')} — {sentiment.totalAnalyzed} actions analysées
          </p>
        </div>
        <button onClick={loadAnalysis} className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border rounded-lg text-xs text-text-secondary hover:text-white hover:border-accent/50 transition-colors self-start sm:self-auto">
          <Activity size={14} />
          Actualiser
        </button>
      </div>

      {/* Sentiment Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-text-secondary" />
            <p className="text-[10px] sm:text-xs text-text-secondary">Sentiment global</p>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${sentiment.score >= 60 ? 'text-positive' : sentiment.score <= 40 ? 'text-negative' : 'text-warning'}`}>
            {sentiment.label}
          </div>
          <div className="mt-2 w-full bg-bg-hover rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${sentiment.score >= 60 ? 'bg-positive' : sentiment.score <= 40 ? 'bg-negative' : 'bg-warning'}`}
              style={{ width: `${sentiment.score}%` }}
            />
          </div>
          <p className="text-[10px] text-text-secondary mt-1">{sentiment.score}/100</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-positive/20 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle size={14} className="text-positive" />
            <p className="text-[10px] sm:text-xs text-text-secondary">Signaux d'achat</p>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-positive">{analysis.topBuys.length}</div>
          {immediateBuys.length > 0 && (
            <p className="text-[10px] text-positive mt-1 flex items-center gap-1">
              <Zap size={10} /> {immediateBuys.length} immédiat{immediateBuys.length > 1 ? 's' : ''}
            </p>
          )}
          {immediateBuys.length === 0 && <p className="text-[10px] text-text-secondary mt-1">0 immédiat</p>}
        </div>

        <div className="bg-bg-card rounded-xl border border-negative/20 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle size={14} className="text-negative" />
            <p className="text-[10px] sm:text-xs text-text-secondary">Signaux de vente</p>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-negative">{analysis.topSells.length}</div>
          {immediateSells.length > 0 && (
            <p className="text-[10px] text-negative mt-1 flex items-center gap-1">
              <AlertTriangle size={10} /> {immediateSells.length} immédiat{immediateSells.length > 1 ? 's' : ''}
            </p>
          )}
          {immediateSells.length === 0 && <p className="text-[10px] text-text-secondary mt-1">0 immédiat</p>}
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-text-secondary" />
            <p className="text-[10px] sm:text-xs text-text-secondary">En attente</p>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-text-primary">{analysis.holds.length}</div>
          <p className="text-[10px] text-text-secondary mt-1">Pas de signal clair</p>
        </div>
      </div>

      {/* Top Buys */}
      {analysis.topBuys.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-positive/30 overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center gap-2 bg-positive/5">
            <TrendingUp size={18} className="text-positive" />
            <h2 className="text-sm font-semibold text-positive">Opportunités d'achat</h2>
            <span className="text-[10px] text-positive/70 ml-auto">{analysis.topBuys.length} action{analysis.topBuys.length > 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border/50">
            {analysis.topBuys.map((stock) => (
              <SignalRow key={stock.ticker} stock={stock} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Top Sells */}
      {analysis.topSells.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-negative/30 overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center gap-2 bg-negative/5">
            <TrendingDown size={18} className="text-negative" />
            <h2 className="text-sm font-semibold text-negative">Actions à éviter / vendre</h2>
            <span className="text-[10px] text-negative/70 ml-auto">{analysis.topSells.length} action{analysis.topSells.length > 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border/50">
            {analysis.topSells.map((stock) => (
              <SignalRow key={stock.ticker} stock={stock} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Holds */}
      {analysis.holds.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center gap-2">
            <MinusCircle size={18} className="text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-secondary">En attente — pas de signal clair</h2>
          </div>
          <div className="divide-y divide-border/50">
            {analysis.holds.map((stock) => (
              <SignalRow key={stock.ticker} stock={stock} navigate={navigate} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalRow({ stock, navigate, compact }: { stock: ActionableStock; navigate: any; compact?: boolean }) {
  const timing = timingConfig[stock.action.timing] || timingConfig.WAIT;
  const TimingIcon = timing.icon;
  const isPositive = stock.changePercent >= 0;
  const isBuy = stock.action.type === 'BUY';

  return (
    <button
      onClick={() => navigate(`/stock/${stock.ticker}`)}
      className="w-full px-3 sm:px-4 py-3 hover:bg-bg-hover transition-colors text-left"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Score circle */}
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
          stock.scoring.globalScore >= 65 ? 'bg-positive/15 text-positive' :
          stock.scoring.globalScore >= 45 ? 'bg-warning/15 text-warning' :
          'bg-negative/15 text-negative'
        }`}>
          {stock.scoring.globalScore}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-white truncate">{stock.name}</span>
            <span className="text-[9px] sm:text-[10px] text-text-secondary bg-bg-hover px-1.5 py-0.5 rounded">{stock.ticker}</span>
            <span className={`text-[10px] sm:text-xs font-mono ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium border ${timing.color}`}>
              <TimingIcon size={9} />
              {timing.label}
            </span>
            <span className="text-[10px] text-text-secondary">{stock.price.toFixed(2)}€</span>
          </div>

          {!compact && (
            <>
              <p className="text-[10px] sm:text-xs text-text-secondary mt-1.5 line-clamp-2">{stock.action.reason}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                {isBuy && (
                  <>
                    <span className="text-[9px] sm:text-[10px] text-text-secondary">
                      Objectif : <span className="text-positive font-mono">{stock.action.targetPrice.toFixed(2)}€</span>
                      <span className="text-positive"> (+{stock.action.potentialGain.toFixed(1)}%)</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-text-secondary">
                      Stop : <span className="text-negative font-mono">{stock.action.stopLoss.toFixed(2)}€</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-text-secondary">
                      R/R : <span className="text-accent font-mono">{stock.action.riskReward.toFixed(1)}x</span>
                    </span>
                  </>
                )}
                {!isBuy && stock.action.type === 'SELL' && (
                  <span className="text-[9px] sm:text-[10px] text-text-secondary">
                    Stop : <span className="text-negative font-mono">{stock.action.stopLoss.toFixed(2)}€</span>
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] text-text-secondary">
                  Confiance : <span className="text-accent font-mono">{stock.action.confidence}%</span>
                </span>
              </div>
            </>
          )}
        </div>

        <ChevronRight size={14} className="text-text-secondary flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
