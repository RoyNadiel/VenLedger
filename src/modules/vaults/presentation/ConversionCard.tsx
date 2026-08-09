import React from 'react';

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
}) => {
  return (
    <div className={`${cardStyleClass} p-4 rounded-2xl shadow-xs`}>
      <div
        className={`text-xs font-semibold ${titleColorClass} uppercase tracking-wider`}
      >
        {title}
      </div>
      <span
        className={`text-xl sm:text-2xl font-black ${amountColorClass} mt-1`}
      >
        {currencySymbol}{' '}
        {amount.toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <div className={`text-[10px] sm:text-xs ${subColorClass} mt-1`}>
        {rateLabel}
      </div>
    </div>
  );
};
