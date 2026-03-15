import { useState } from 'react';
import { X } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';
import toast from 'react-hot-toast';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPositionModal({ isOpen, onClose }: AddPositionModalProps) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [date, setDate] = useState('');

  const { stocks } = useMarketStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !quantity || !buyPrice || !date) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    toast.success(`Position ${ticker} ajoutée avec succès`);
    onClose();
    setTicker('');
    setQuantity('');
    setBuyPrice('');
    setDate('');
  };

  const selectedStock = stocks.find((s) => s.ticker === ticker);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Ajouter une position</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Action</label>
            <select
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value);
                const s = stocks.find((st) => st.ticker === e.target.value);
                if (s) setBuyPrice(s.price.toFixed(2));
              }}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="">Sélectionner une action</option>
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.name} ({s.ticker})
                </option>
              ))}
            </select>
          </div>

          {selectedStock && (
            <div className="bg-bg-primary rounded-lg p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Cours actuel</span>
                <span className="text-text-primary font-mono">{selectedStock.price.toFixed(2)} EUR</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Quantité</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Prix d'achat (EUR)</label>
              <input
                type="number"
                step="0.01"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder="100.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">Date d'achat</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {quantity && buyPrice && (
            <div className="bg-bg-primary rounded-lg p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Montant total</span>
                <span className="text-accent font-mono font-medium">
                  {(parseFloat(quantity) * parseFloat(buyPrice)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-bg-hover text-text-secondary rounded-lg text-sm font-medium hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
