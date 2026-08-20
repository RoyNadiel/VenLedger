import React, { useState } from 'react';
import { useInitialization } from './modules/shared/presentation/useInitialization';
import { Header, type Tab } from './modules/shared/presentation/Header';
import { RatesBar } from './modules/rates/presentation/RatesBar';
import { DashboardView } from './modules/analytics/presentation/DashboardView';
import { VaultsSummary } from './modules/vaults/presentation/VaultsSummary';
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
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-8 transition-colors">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <RatesBar />
      <main className="max-w-[1440px] w-full mx-auto p-4 flex-1">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'vaults' && <VaultsSummary hideSummaryOnMobile />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'debts' && <DebtsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Navegación por pestañas móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-40 px-2 py-2 transition-colors">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Resumen
          </button>

          <button
            onClick={() => setActiveTab('vaults')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
              activeTab === 'vaults'
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Landmark className="w-4 h-4 mb-0.5" />
            Bóvedas
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 mb-0.5" />
            Movimientos
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
              activeTab === 'debts'
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <Handshake className="w-4 h-4 mb-0.5" />
            Deudas
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all duration-150 select-none cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            Salud
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
