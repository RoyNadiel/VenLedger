import React from 'react';
import { useRatesStore } from './useRatesStore';
import { RefreshCw } from 'lucide-react';

export const RatesBar: React.FC = () => {
  const { rates, isLoading, fetchRates } = useRatesStore();

  return (
    <div className="bg-sky-50/70 border-b border-sky-100 px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-medium text-slate-700">
      <div className="max-w-[1480px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="grid grid-cols-3 justify-items-center sm:flex sm:items-center gap-1 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Tasa </span>BCV USD:
            </span>
            <span className="font-bold text-sky-800 bg-white px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.usd_official.toFixed(2)}` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Tasa </span>BCV EUR:
            </span>
            <span className="font-bold text-sky-800 bg-white px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.eur_official.toFixed(2)}` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0">
            <span className="text-slate-500 font-semibold text-xs sm:text-sm shrink-0">
              <span className="hidden sm:inline">Binance </span>USDT:
            </span>
            <span className="font-bold text-sky-950 bg-white px-1 sm:px-2 py-0.5 rounded-md border border-sky-300 text-xs sm:text-sm shrink-0">
              {rates ? `${rates.usd_libre.toFixed(2)}` : '...'}
            </span>
          </div>
        </div>

        <button
          onClick={() => void fetchRates()}
          disabled={isLoading}
          className="text-sky-600 hover:text-sky-800 transition-colors shrink-0 flex items-center space-x-1 disabled:opacity-50 cursor-pointer font-bold p-1 sm:p-0"
          title="Actualizar Tasas"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Actualizar Tasas</span>
        </button>
      </div>
    </div>
  );
};
