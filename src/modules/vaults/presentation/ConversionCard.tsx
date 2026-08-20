import React, { useState } from 'react';
import type { VesImpactPeriods } from '../../rates/domain/vesImpactEngine';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export interface ConversionCardProps {
  title: string;
  amount: number;
  currencySymbol: string;
  locale?: 'en-US' | 'es-VE' | 'de-DE';
  cardStyleClass?: string;
  titleColorClass?: string;
  amountColorClass?: string;
  subColorClass?: string;
  rateLabel: string;
  vesImpact?: VesImpactPeriods | null;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  title,
  amount,
  currencySymbol,
  locale = 'en-US',
  rateLabel,
  vesImpact,
}) => {
  const [period, setPeriod] = useState<'day1' | 'days7' | 'days30'>('day1');

  const activeImpact = vesImpact ? vesImpact[period] : null;

  return (
    <div className="py-2 px-3 flex flex-col justify-between min-w-0 transition-colors">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 min-h-[24px]">
          <div className="text-[11px] font-title-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </div>

          {vesImpact && (
            <div className="inline-flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
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
                  className={`px-1.5 py-0.5 rounded text-[9px] font-title-semibold transition-all duration-150 cursor-pointer select-none ${
                    period === p.key
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-1">
          <span className="text-xl lg:text-2xl font-title-bold text-zinc-900 dark:text-zinc-100 block truncate tracking-tight">
            {currencySymbol}{' '}
            {amount.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span className="text-[11px] font-title-semibold text-zinc-500 dark:text-zinc-400 truncate">
          {rateLabel}
        </span>

        {activeImpact && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-title-semibold border ${
              activeImpact.deltaUSD < 0
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                : activeImpact.deltaUSD > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {activeImpact.deltaUSD < 0 ? (
              <TrendingDown className="w-3 h-3 mr-1 shrink-0" />
            ) : activeImpact.deltaUSD > 0 ? (
              <TrendingUp className="w-3 h-3 mr-1 shrink-0" />
            ) : (
              <Minus className="w-3 h-3 mr-1 shrink-0" />
            )}
            <span>
              {`${activeImpact.deltaUSD < 0 ? '-' : '+'}$${Math.abs(activeImpact.deltaUSD).toFixed(2)} USD`}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
