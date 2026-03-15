import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMarketStore } from '../../stores/marketStore';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { stocks } = useMarketStore();

  const filteredStocks = searchQuery.length > 0
    ? stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectStock = (ticker: string) => {
    setSearchQuery('');
    navigate(`/stock/${ticker}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-bg-card border-b border-border flex items-center justify-between px-3 sm:px-6 gap-3">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-bg-hover transition-colors md:hidden flex-shrink-0"
      >
        <Menu size={20} className="text-text-secondary" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Rechercher une action..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
        />
        {filteredStocks.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {filteredStocks.map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => handleSelectStock(stock.ticker)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-bg-hover text-left transition-colors"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-text-primary truncate">{stock.name}</span>
                  <span className="text-xs text-text-secondary ml-1.5">{stock.ticker}</span>
                </div>
                <span className={`text-sm font-mono flex-shrink-0 ml-2 ${stock.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {stock.price.toFixed(2)}€
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-negative rounded-full" />
        </button>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <User size={16} className="text-accent" />
              </div>
              <span className="text-sm text-text-primary hidden sm:inline">{user?.name || 'Investisseur'}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-bg-card border border-border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-negative hover:bg-bg-hover transition-colors"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-3 sm:px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            Connexion
          </button>
        )}
      </div>
    </header>
  );
}
