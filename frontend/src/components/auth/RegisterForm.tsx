import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      login(
        { id: '1', email, name, createdAt: new Date().toISOString() },
        'mock-jwt-token-12345'
      );
      toast.success('Compte créé avec succès');
      navigate('/');
    } catch {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Bours<span className="text-accent">IA</span>
          </span>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Créer un compte</h2>
          <p className="text-sm text-text-secondary mb-6">Rejoignez BoursIA pour des analyses intelligentes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                  placeholder="Min. 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="Confirmez le mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
