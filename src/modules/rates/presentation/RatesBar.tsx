import React from 'react';
import { useRatesStore } from './useRatesStore';
import { RefreshCw } from 'lucide-react';

export const RatesBar: React.FC = () => {
  const { rates, rateTimestamp, isLoading, fetchRates } = useRatesStore();

  const formattedDate = rateTimestamp
    ? new Date(rateTimestamp).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-6 flex-1 min-w-0 overflow-x-auto">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">
              BCV USD:
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs">
              {rates ? `${rates.usd_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">
              BCV EUR:
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs">
              {rates ? `${rates.eur_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">
              Binance P2P:
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs">
              {rates ? `${rates.usd_libre.toFixed(2)} Bs` : '...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {formattedDate && (
            <span
              className="hidden md:inline-block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
              title={`Fecha oficial asignada por el BCV: ${rateTimestamp}`}
            >
              BCV {formattedDate}
            </span>
          )}

          <button
            onClick={() => void fetchRates(true)}
            disabled={isLoading}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer text-xs font-medium"
            title="Actualizar Tasas"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
