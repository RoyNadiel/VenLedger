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
    <div id="tour-rates" className="bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 py-1.5 sm:py-2 text-xs transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Grid de 3 columnas en móvil, Flex desglosado en desktop */}
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:space-x-6 flex-1 min-w-0 gap-1 sm:gap-4">
          {/* BCV USD */}
          <div className="flex items-center justify-start space-x-1.5 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[10px] sm:text-xs">
              <span className="inline sm:hidden">USD:</span>
              <span className="hidden sm:inline">BCV USD:</span>
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 sm:bg-white sm:dark:bg-zinc-800 sm:px-2 sm:py-0.5 sm:rounded sm:border sm:border-zinc-200 sm:dark:border-zinc-700 text-[11px] sm:text-xs">
              {rates ? `${rates.usd_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          {/* BCV EUR */}
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[10px] sm:text-xs">
              <span className="inline sm:hidden">EUR:</span>
              <span className="hidden sm:inline">BCV EUR:</span>
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 sm:bg-white sm:dark:bg-zinc-800 sm:px-2 sm:py-0.5 sm:rounded sm:border sm:border-zinc-200 sm:dark:border-zinc-700 text-[11px] sm:text-xs">
              {rates ? `${rates.eur_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          {/* Binance P2P */}
          <div className="flex items-center justify-end sm:justify-start space-x-1.5 shrink-0">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[10px] sm:text-xs">
              <span className="inline sm:hidden">USDT:</span>
              <span className="hidden sm:inline">Binance USDT:</span>
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 sm:bg-white sm:dark:bg-zinc-800 sm:px-2 sm:py-0.5 sm:rounded sm:border sm:border-zinc-200 sm:dark:border-zinc-700 text-[11px] sm:text-xs">
              {rates ? `${rates.usd_libre.toFixed(2)} Bs` : '...'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 pl-1 border-l border-zinc-200 dark:border-zinc-800 sm:border-0 sm:pl-0">
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
