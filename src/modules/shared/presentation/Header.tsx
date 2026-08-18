import React from 'react';
// import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';
import { VenLedgerLogo } from './VenLedgerLogo';
import { ThemeToggle } from './ThemeToggle';
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
  // const { pendingCount } = useOutboxStore();

  const navItems: Array<{
    id: Tab;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      activeClass: 'bg-white text-sky-600 shadow-xs',
    },
    {
      id: 'vaults',
      label: 'Bóvedas',
      icon: <Landmark className="w-4 h-4" />,
      activeClass: 'bg-white text-indigo-600 shadow-xs',
    },
    {
      id: 'transactions',
      label: 'Movimientos',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      activeClass: 'bg-white text-emerald-600 shadow-xs',
    },
    {
      id: 'debts',
      label: 'Deudas',
      icon: <Handshake className="w-4 h-4" />,
      activeClass: 'bg-white text-rose-600 shadow-xs',
    },
    {
      id: 'analytics',
      label: 'Salud Financiera',
      icon: <BarChart3 className="w-4 h-4" />,
      activeClass: 'bg-white text-purple-600 shadow-xs',
    },
  ];

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 py-3 px-2 hadow-xs transition-colors">
      <div className="max-w-[1480px] w-full mx-auto flex items-center justify-between">
        {/* Logo & Marca */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer text-left focus:outline-none group active:scale-95 transition-all duration-150 select-none"
          title="Ir al Resumen / Dashboard"
        >
          <VenLedgerLogo size={36} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
              VenLedger
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Control Financiero Venezuela
            </p>
          </div>
        </button>

        {/* Navegación Desktop (Visible en pantallas medianas y grandes) */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 select-none cursor-pointer ${
                  isActive
                    ? item.activeClass
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span
                  className={
                    isActive ? '' : 'text-slate-400 dark:text-slate-500'
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lado Derecho Header: Botón Cambio de Tema + Sync discreto */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* {pendingCount > 0 && (
            <span
              className="inline-flex items-center p-2 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 dark:text-white dark:border-amber-600 text-amber-800 border border-amber-200"
              title={`${pendingCount} cambio(s) pendiente(s) por sincronizar`}
            >
              <span className="w-2 h-2 mr-1 rounded-full bg-amber-500 animate-pulse"></span>
              {pendingCount}
            </span>
          )} */}
        </div>
      </div>
    </header>
  );
};
