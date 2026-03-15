import { useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  ticker: string;
  name: string;
  type: 'price_above' | 'price_below' | 'score_change' | 'recommendation';
  value: string;
  active: boolean;
  createdAt: string;
}

const mockAlerts: Alert[] = [
  { id: '1', ticker: 'MC.PA', name: 'LVMH', type: 'price_above', value: '750.00 EUR', active: true, createdAt: '2025-03-10' },
  { id: '2', ticker: 'KER.PA', name: 'Kering', type: 'price_below', value: '300.00 EUR', active: true, createdAt: '2025-03-08' },
  { id: '3', ticker: 'SAF.PA', name: 'Safran', type: 'score_change', value: 'Score IA < 80', active: false, createdAt: '2025-03-05' },
  { id: '4', ticker: 'TTE.PA', name: 'TotalEnergies', type: 'recommendation', value: 'Changement de signal', active: true, createdAt: '2025-03-01' },
];

const typeLabels: Record<Alert['type'], string> = {
  price_above: 'Prix au-dessus de',
  price_below: 'Prix en-dessous de',
  score_change: 'Changement de score',
  recommendation: 'Changement de recommandation',
};

const typeIcons: Record<Alert['type'], typeof TrendingUp> = {
  price_above: TrendingUp,
  price_below: TrendingDown,
  score_change: Target,
  recommendation: Bell,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alerte supprimée');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-accent" />
            Mes Alertes
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">{alerts.filter((a) => a.active).length} alertes actives</p>
        </div>
        <button
          onClick={() => toast('Fonctionnalité bientôt disponible', { icon: 'bell' })}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouvelle alerte
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = typeIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={`bg-bg-card rounded-xl border p-4 flex items-center gap-4 transition-all ${
                alert.active ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                alert.active ? 'bg-accent/15' : 'bg-bg-hover'
              }`}>
                <Icon size={20} className={alert.active ? 'text-accent' : 'text-text-secondary'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{alert.name}</span>
                  <span className="text-xs text-text-secondary">{alert.ticker}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {typeLabels[alert.type]} : <span className="text-text-primary">{alert.value}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    alert.active ? 'bg-accent' : 'bg-bg-hover'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      alert.active ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-negative transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <Bell size={40} className="text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">Aucune alerte configurée</p>
            <p className="text-xs text-text-secondary mt-1">Créez des alertes pour suivre vos actions en temps réel</p>
          </div>
        )}
      </div>
    </div>
  );
}
