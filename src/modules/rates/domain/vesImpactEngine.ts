export interface VesPeriodImpact {
  deltaUSD: number;
  deltaVES: number;
  pastRate: number;
}

export interface VesImpactPeriods {
  day1: VesPeriodImpact | null; // Ayer
  days7: VesPeriodImpact | null; // 7 días
  days30: VesPeriodImpact | null; // 30 días
}

export class VesImpactEngine {
  /**
   * Calcula la pérdida o ganancia en USD y Bs para un saldo en Bolívares frente a una tasa pasada.
   * Delta USD = (Saldo / Tasa Actual) - (Saldo / Tasa Pasada)
   * Delta VES = Delta USD * Tasa Actual
   */
  static calculateImpact(
    vesAmount: number,
    currentRate: number,
    pastRate: number
  ): VesPeriodImpact | null {
    if (!vesAmount || vesAmount <= 0 || !currentRate || !pastRate || currentRate <= 0 || pastRate <= 0) {
      return null;
    }

    const usdCurrent = vesAmount / currentRate;
    const usdPast = vesAmount / pastRate;
    const deltaUSD = usdCurrent - usdPast;
    const deltaVES = deltaUSD * currentRate;

    return {
      deltaUSD,
      deltaVES,
      pastRate,
    };
  }
}
