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
    <div
      className={`${cardStyleClass} p-3.5 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between min-w-0`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1.5 min-h-[26px]">
          <div
            className={`text-xs sm:text-sm font-bold ${titleColorClass} uppercase tracking-wider shrink-0`}
          >
            {title}
          </div>

          {vesImpact && (
            <div className="inline-flex items-center p-0.5 bg-slate-900/5 rounded-full border border-slate-900/5 backdrop-blur-xs shrink-0">
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
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-all duration-150 cursor-pointer select-none ${
                    period === p.key
                      ? 'bg-white text-sky-950 font-bold shadow-xs ring-1 ring-slate-900/10 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 font-semibold'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 min-w-0 flex-wrap">
          <span
            className={`text-xl sm:text-3xl font-black ${amountColorClass} shrink-0`}
          >
            {currencySymbol}{' '}
            {amount.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          {activeImpact && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black border shrink-0 ${
                activeImpact.deltaUSD < 0
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : activeImpact.deltaUSD > 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={`Impacto comparado con la tasa de ${
                period === 'day1'
                  ? 'ayer'
                  : period === 'days7'
                    ? 'hace 7 días'
                    : 'hace 30 días'
              } (${activeImpact.pastRate.toFixed(2)} Bs/USD)`}
            >
              {activeImpact.deltaUSD < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 mr-1 shrink-0 stroke-[2.5]" />
              ) : activeImpact.deltaUSD > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0 stroke-[2.5]" />
              ) : (
                <Minus className="w-3.5 h-3.5 mr-1 shrink-0 stroke-[2.5]" />
              )}
              <span>
                {currencySymbol === 'Bs.'
                  ? `${activeImpact.deltaVES < 0 ? '' : '+'}${activeImpact.deltaVES.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Bs.`
                  : `${activeImpact.deltaUSD < 0 ? '-' : '+'}$${Math.abs(activeImpact.deltaUSD).toFixed(2)} USD`}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className={`text-xs sm:text-sm font-medium ${subColorClass} mt-3.5 truncate`}>
        {rateLabel}
      </div>
    </div>
  );
};
