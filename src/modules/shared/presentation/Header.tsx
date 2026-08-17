import React from 'react';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Handshake,
  BarChart3,
} from 'lucide-react';

export type Tab =
  | 'dashboard'
  | 'vaults'
  | 'transactions'
  | 'debts'
  | 'analytics';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { pendingCount } = useOutboxStore();

  const navItems: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vaults', label: 'Bóvedas', icon: <Landmark className="w-4 h-4" /> },
    { id: 'transactions', label: 'Movimientos', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'debts', label: 'Deudas', icon: <Handshake className="w-4 h-4" /> },
    { id: 'analytics', label: 'Salud Financiera', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
      <div className="max-w-[1480px] w-full mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer text-left focus:outline-none group"
          title="Ir al Resumen / Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-xl shadow-xs group-hover:bg-sky-600 transition-colors">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-sky-600 transition-colors">
              VenLedger
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Control Financiero Venezuela
            </p>
          </div>
        </button>

        {/* Navegación Desktop (Visible en pantallas medianas y grandes) */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Indicador discreto de estado de sincronización */}
        <div className="flex items-center space-x-2">
          {pendingCount === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronizado
            </span>
          ) : (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
              title="Cambios guardados localmente en cola"
            >
              <span className="w-2 h-2 mr-1.5 rounded-full bg-amber-500"></span>
              {pendingCount}{' '}
              {pendingCount === 1 ? 'cambio local' : 'cambios locales'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
