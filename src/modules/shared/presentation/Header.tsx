import React from 'react';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';
import { VenLedgerLogo } from './VenLedgerLogo';
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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-xs">
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
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 select-none cursor-pointer ${
                  isActive
                    ? item.activeClass
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <span className={isActive ? '' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lado Derecho Header: Botón Rápido + Nuevo y Sync discreto */}
        <div className="flex items-center space-x-2">
          {/* <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-150 select-none cursor-pointer"
            title="Registrar nuevo movimiento"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuevo</span>
          </button> */}

          {pendingCount > 0 && (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
              title={`${pendingCount} cambio(s) pendiente(s) por sincronizar`}
            >
              <span className="w-2 h-2 mr-1 rounded-full bg-amber-500 animate-pulse"></span>
              {pendingCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
