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
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 p-6 rounded-2xl max-w-sm w-full text-center space-y-2">
          <h2 className="text-lg font-bold text-rose-700">
            Error al Iniciar VenLedger
          </h2>
          <p className="text-xs text-slate-600">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">
            Cargando VenLedger...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-8 transition-colors">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <RatesBar />
      <main className="max-w-[1480px] w-full mx-auto p-2 flex-1">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'vaults' && <VaultsSummary />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'debts' && <DebtsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Navegación por pestañas móvil (oculta en escritorio) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-2 transition-colors">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-90 select-none cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-sky-600 bg-sky-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            Resumen
          </button>

          <button
            onClick={() => setActiveTab('vaults')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-90 select-none cursor-pointer ${
              activeTab === 'vaults'
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            Bóvedas
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-90 select-none cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 mb-0.5" />
            Movimientos
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-90 select-none cursor-pointer ${
              activeTab === 'debts'
                ? 'text-rose-600 bg-rose-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Handshake className="w-5 h-5 mb-0.5" />
            Deudas
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-90 select-none cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-purple-600 bg-purple-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            Salud
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
