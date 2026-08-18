import React, { useState } from 'react';
import type { RateVariations, MoneyVariations } from '../../rates/domain/rateVariationEngine';
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
  variations?: RateVariations | null;
  moneyVariations?: MoneyVariations | null;
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
  variations,
  moneyVariations,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'days2' | 'days7' | 'days15' | 'days30'
  >('days7');

  const currentVal = variations ? variations[selectedPeriod] : null;
  const currentMoney = moneyVariations ? moneyVariations[selectedPeriod] : null;

  return (
    <div className={`${cardStyleClass} p-4 rounded-2xl shadow-xs flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between gap-1">
          <div
            className={`text-xs font-semibold ${titleColorClass} uppercase tracking-wider`}
          >
            {title}
          </div>

          {(variations || moneyVariations) && (
            <div className="flex items-center space-x-1 bg-white/60 p-0.5 rounded-lg border border-slate-200/60 text-[10px]">
              {(['days2', 'days7', 'days15', 'days30'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    selectedPeriod === period
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  {period.replace('days', '')}d
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

          {currentVal !== null && currentVal !== undefined && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${
                currentVal < 0
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : currentVal > 0
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={`Variación del poder adquisitivo a los ${selectedPeriod.replace('days', '')} días`}
            >
              {currentVal < 0 ? (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              ) : currentVal > 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5" />
              )}
              {currentVal > 0 ? `+${currentVal.toFixed(1)}%` : `${currentVal.toFixed(1)}%`}
            </span>
          )}
        </div>

        {/* Despliegue de dinero ganado/perdido nominalmente en USD o Bs. */}
        {currentMoney && Math.abs(currentMoney.deltaUSD) > 0.01 && (
          <div
            className={`text-[11px] font-bold mt-1 ${
              currentMoney.deltaUSD < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {currentMoney.deltaUSD < 0 ? 'Pérdida estimada: ' : 'Ganancia estimada: '}
            {currencySymbol === 'Bs.'
              ? `${currentMoney.deltaVES.toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} Bs.`
              : `${currencySymbol}${Math.abs(currentMoney.deltaUSD).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </div>
        )}
      </div>

      <div className={`text-[10px] sm:text-xs ${subColorClass} mt-2`}>
        {rateLabel}
      </div>
    </div>
  );
};
