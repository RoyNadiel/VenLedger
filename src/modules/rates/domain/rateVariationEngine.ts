export interface RateVariations {
  days2: number | null;
  days7: number | null;
  days15: number | null;
  days30: number | null;
}

export class RateVariationEngine {
  /**
   * Calcula el porcentaje de variación del poder adquisitivo en USD para fondos en Bolívares.
   * Variación % = ((Tasa Pasada / Tasa Actual) - 1) * 100
   * Ej: Si la tasa subió de 30 a 40 Bs/USD: ((30/40) - 1)*100 = -25% (Pérdida de valor)
   */
  static calculatePurchasingPowerChange(
    currentRate: number,
    pastRate: number
  ): number {
    if (!currentRate || !pastRate || currentRate <= 0 || pastRate <= 0) return 0;
    return ((pastRate / currentRate) - 1) * 100;
  }
}
