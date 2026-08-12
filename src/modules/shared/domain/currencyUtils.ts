import type { Currency, ExchangeRates } from './types';

export interface PaymentRateInfo {
  rateUsed: number;
  rateType: 'bcv' | 'libre';
}

/**
 * Obtiene la tasa de cambio en VES por cada unidad de la moneda especificada.
 */
export function getRateInVES(
  curr: Currency | string,
  rates: ExchangeRates | null,
  overrideRate?: number
): number {
  if (curr === 'VES') return 1;
  if (overrideRate && overrideRate > 0) return overrideRate;
  if (!rates) return 1;

  switch (curr) {
    case 'USD':
      return rates.usd_official || 1;
    case 'USDT':
      return rates.usd_libre || 1;
    case 'EUR':
      return rates.eur_official || 1;
    case 'VES':
    default:
      return 1;
  }
}

/**
 * Retorna la tasa y el tipo de tasa (bcv/libre) aplicable a la moneda de un pago/abono.
 */
export function getPaymentRateInfo(
  paymentCurrency: Currency | string,
  rates: ExchangeRates | null
): PaymentRateInfo {
  if (!rates) return { rateUsed: 1, rateType: 'libre' };

  switch (paymentCurrency) {
    case 'USD':
      return { rateUsed: rates.usd_official, rateType: 'bcv' };
    case 'EUR':
      return { rateUsed: rates.eur_official, rateType: 'bcv' };
    case 'USDT':
    case 'VES':
    default:
      return { rateUsed: rates.usd_libre, rateType: 'libre' };
  }
}

/**
 * Convierte un monto de una moneda a otra utilizando el Bolívar (VES) como pivote central.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency | string,
  toCurrency: Currency | string,
  rates: ExchangeRates | null
): number {
  if (fromCurrency === toCurrency || !rates || amount === 0) return amount;

  const amountInVES = amount * getRateInVES(fromCurrency, rates);
  const targetRateInVES = getRateInVES(toCurrency, rates);

  return targetRateInVES > 0 ? amountInVES / targetRateInVES : amountInVES;
}

/**
 * Retorna el símbolo formateado para cada moneda.
 */
export function getCurrencySymbol(currency: Currency | string): string {
  switch (currency) {
    case 'VES':
      return 'Bs.';
    case 'EUR':
      return '€';
    case 'USD':
    case 'USDT':
    default:
      return '$';
  }
}
