import React from 'react';
import { useRatesStore } from './useRatesStore';
import { RefreshCw } from 'lucide-react';

export const RatesBar: React.FC = () => {
  const { rates, isLoading, fetchRates } = useRatesStore();

  return (
    <div className="bg-sky-50/70 border-b border-sky-100 px-4 py-2 text-xs font-medium text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Tasa BCV USD:</span>
            <span className="font-bold text-sky-800 bg-white px-2 py-0.5 rounded-md border border-sky-200">
              {rates ? `${rates.usd_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Tasa BCV EUR:</span>
            <span className="font-bold text-sky-800 bg-white px-2 py-0.5 rounded-md border border-sky-200">
              {rates ? `${rates.eur_official.toFixed(2)} Bs` : '...'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Binance USDT:</span>
            <span className="font-bold text-sky-950 bg-sky-200/80 px-2 py-0.5 rounded-md border border-sky-300">
              {rates ? `${rates.usd_libre.toFixed(2)} Bs` : '...'}
            </span>
          </div>
        </div>

        <button
          onClick={() => void fetchRates()}
          disabled={isLoading}
          className="text-sky-600 hover:text-sky-800 transition-colors shrink-0 flex items-center space-x-1 disabled:opacity-50 cursor-pointer font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar Tasas</span>
        </button>
      </div>
    </div>
  );
};
