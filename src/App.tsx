import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useInitialization } from './modules/shared/presentation/useInitialization';
import { Header } from './modules/shared/presentation/Header';
import { RatesBar } from './modules/rates/presentation/RatesBar';
import { ScrollToTop } from './modules/shared/presentation/ScrollToTop';
import { DashboardView } from './modules/analytics/presentation/DashboardView';
import { VaultsSummary } from './modules/vaults/presentation/VaultsSummary';
import { VaultDetailRoute } from './modules/vaults/presentation/VaultDetailRoute';
import { TransactionsView } from './modules/transactions/presentation/TransactionsView';
import { DebtsView } from './modules/debts/presentation/DebtsView';
import { AnalyticsView } from './modules/analytics/presentation/AnalyticsView';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Handshake,
  BarChart3,
} from 'lucide-react';

export const App: React.FC = () => {
  const { isInitialized, initError } = useInitialization();

  if (initError) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl max-w-sm w-full text-center space-y-2">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
            Error al Iniciar VenLedger
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Cargando VenLedger...
          </span>
        </div>
      </div>
    );
  }

  const mobileNavItems = [
    { path: '/', label: 'Resumen', icon: <LayoutDashboard className="w-4 h-4 mb-0.5" /> },
    { path: '/vaults', label: 'Bóvedas', icon: <Landmark className="w-4 h-4 mb-0.5" /> },
    { path: '/transactions', label: 'Movimientos', icon: <ArrowLeftRight className="w-4 h-4 mb-0.5" /> },
    { path: '/debts', label: 'Deudas', icon: <Handshake className="w-4 h-4 mb-0.5" /> },
    { path: '/analytics', label: 'Salud', icon: <BarChart3 className="w-4 h-4 mb-0.5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-8 transition-colors">
      <ScrollToTop />
      <Header />
      <RatesBar />
      <main className="max-w-[1440px] w-full mx-auto p-4 flex-1">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/vaults" element={<VaultsSummary hideSummaryOnMobile />} />
          <Route path="/vaults/:vaultId" element={<VaultDetailRoute />} />
          <Route path="/transactions" element={<TransactionsView />} />
          <Route path="/debts" element={<DebtsView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Navegación por pestañas móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-40 px-2 py-2 transition-colors">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
                  isActive
                    ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
