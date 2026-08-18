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
    <div className="bg-sky-50/70 dark:bg-slate-900/80  border-sky-100 dark:border-slate-800 px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
      <div className="max-w-[1480px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="grid grid-cols-3 justify-items-center sm:flex sm:items-center gap-1 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Tasa </span>BCV USD:
            </span>
            <span className="font-bold text-sky-800 dark:text-sky-300 bg-white dark:bg-slate-800 px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 dark:border-slate-700 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.usd_official.toFixed(2)}` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Tasa </span>BCV EUR:
            </span>
            <span className="font-bold text-sky-800 dark:text-sky-300 bg-white dark:bg-slate-800 px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 dark:border-slate-700 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.eur_official.toFixed(2)}` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Binance </span>USDT:
            </span>
            <span className="font-bold text-sky-950 dark:text-sky-200 bg-white dark:bg-slate-800 px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 dark:border-slate-700 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.usd_libre.toFixed(2)}` : '...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {formattedDate && (
            <span
              className="hidden md:inline-block text-[11px] text-slate-400 dark:text-slate-300 font-semibold bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
              title={`Fecha oficial asignada por el BCV: ${rateTimestamp}`}
            >
              BCV {formattedDate}
            </span>
          )}

          <button
            onClick={() => void fetchRates(true)}
            disabled={isLoading}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors flex items-center space-x-1 disabled:opacity-50 cursor-pointer font-bold p-1 sm:p-0"
            title="Actualizar Tasas"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Actualizar Tasas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
