import React, { useState } from 'react';
import type { VesImpactPeriods } from '../../rates/domain/vesImpactEngine';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export interface ConversionCardProps {
  title: string;
  amount: number;
  currencySymbol: string;
  locale?: 'en-US' | 'es-VE' | 'de-DE';
  cardStyleClass: string;
  titleColorClass: string;
  amountColorClass: string;
  subColorClass: string;
  rateLabel: string;
  vesImpact?: VesImpactPeriods | null;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  title,
  amount,
  currencySymbol,
  locale = 'en-US',
  cardStyleClass,
  titleColorClass,
  amountColorClass,
  subColorClass,
  rateLabel,
  vesImpact,
}) => {
  const [period, setPeriod] = useState<'day1' | 'days7' | 'days30'>('days7');

  const activeImpact = vesImpact ? vesImpact[period] : null;

  return (
    <div className={`${cardStyleClass} p-4 rounded-2xl shadow-xs flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between gap-1">
          <div
            className={`text-xs font-semibold ${titleColorClass} uppercase tracking-wider`}
          >
            {title}
          </div>

          {vesImpact && (
            <div className="flex space-x-1 bg-white/60 p-0.5 rounded-lg border border-slate-200/60 text-[10px] font-bold">
              {(
                [
                  { key: 'day1', label: 'Ayer' },
                  { key: 'days7', label: '7d' },
                  { key: 'days30', label: '30d' },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                    period === p.key
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-1">
          <span
            className={`text-xl sm:text-2xl font-black ${amountColorClass}`}
          >
            {currencySymbol}{' '}
            {amount.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          {activeImpact && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-extrabold border shrink-0 ${
                activeImpact.deltaUSD < 0
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : activeImpact.deltaUSD > 0
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={`Impacto comparado con la tasa de ${
                period === 'day1' ? 'ayer' : period === 'days7' ? 'hace 7 días' : 'hace 30 días'
              } (${activeImpact.pastRate.toFixed(2)} Bs/USD)`}
            >
              {activeImpact.deltaUSD < 0 ? (
                <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />
              ) : activeImpact.deltaUSD > 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5 shrink-0" />
              )}
              {currencySymbol === 'Bs.'
                ? `${activeImpact.deltaVES < 0 ? '' : '+'}${activeImpact.deltaVES.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Bs.`
                : `${activeImpact.deltaUSD < 0 ? '-' : '+'}$${Math.abs(activeImpact.deltaUSD).toFixed(2)} USD`}
            </span>
          )}
        </div>
      </div>

      <div className={`text-[10px] sm:text-xs ${subColorClass} mt-2`}>
        {rateLabel}
      </div>
    </div>
  );
};
