import React, { useState } from 'react';
import { useInitialization } from './modules/shared/presentation/useInitialization';
import { Header, type Tab } from './modules/shared/presentation/Header';
import { RatesBar } from './modules/rates/presentation/RatesBar';
import { DashboardView } from './modules/analytics/presentation/DashboardView';
import { VaultsSummary } from './modules/vaults/presentation/VaultsSummary';
import { TransactionsView } from './modules/transactions/presentation/TransactionsView';
import { DebtsView } from './modules/debts/presentation/DebtsView';
import { AnalyticsView } from './modules/analytics/presentation/AnalyticsView';
import { Landmark, ArrowLeftRight, Handshake, BarChart3 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-8">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <RatesBar />

      <main className="max-w-[1480px] w-full mx-auto p-4 flex-1">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'vaults' && <VaultsSummary />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'debts' && <DebtsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Navegación por pestañas móvil (oculta en escritorio) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 px-4 py-2">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('vaults')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'vaults'
                ? 'text-sky-600 bg-sky-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Landmark className="w-5 h-5 mb-0.5" />
            Bóvedas
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-sky-600 bg-sky-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 mb-0.5" />
            Movimientos
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'debts'
                ? 'text-sky-600 bg-sky-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Handshake className="w-5 h-5 mb-0.5" />
            Deudas
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-sky-600 bg-sky-50'
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
