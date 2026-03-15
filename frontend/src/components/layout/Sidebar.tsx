import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Briefcase,
  Bell,
  TrendingUp,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/market', icon: BarChart3, label: 'Marché CAC 40' },
  { to: '/portfolio', icon: Briefcase, label: 'Mon Portefeuille' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`sidebar fixed left-0 top-0 h-screen bg-bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? 'sidebar-open' : ''
      }`}
      style={{ width: '240px' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Bours<span className="text-accent">IA</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors md:hidden"
        >
          <X size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-text-secondary text-center">BoursiA v1.0 — Analyse CAC 40</p>
      </div>
    </aside>
  );
}
