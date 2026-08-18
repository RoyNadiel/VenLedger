export interface RateVariations {
  days2: number | null;
  days7: number | null;
  days15: number | null;
  days30: number | null;
}

export interface MoneyValueChange {
  deltaUSD: number;
  deltaVES: number;
  percent: number;
}

export interface MoneyVariations {
  days2: MoneyValueChange | null;
  days7: MoneyValueChange | null;
  days15: MoneyValueChange | null;
  days30: MoneyValueChange | null;
}

export class RateVariationEngine {
  /**
   * Porcentaje de variación de la tasa cambiaria.
   * Ej: Si la tasa pasa de 50 a 55 Bs/USD, subió +10%.
   */
  static calculateRatePercentChange(
    currentRate: number,
    pastRate: number
  ): number {
    if (!currentRate || !pastRate || currentRate <= 0 || pastRate <= 0) return 0;
    return ((currentRate - pastRate) / pastRate) * 100;
  }

  /**
   * Porcentaje de variación del poder adquisitivo en USD para fondos en Bolívares.
   * Ej: Si la tasa pasa de 50 a 55 Bs/USD, el dinero vale -9.09% en USD.
   */
  static calculatePurchasingPowerChange(
    currentRate: number,
    pastRate: number
  ): number {
    if (!currentRate || !pastRate || currentRate <= 0 || pastRate <= 0) return 0;
    return ((pastRate / currentRate) - 1) * 100;
  }

  /**
   * Calcula el dinero ganado/perdido en USD y en Bs equivalente debido a la variación de la tasa.
   * @param vesAmount Saldo total en Bolívares
   * @param currentRate Tasa actual (Bs/USD)
   * @param pastRate Tasa de hace N días (Bs/USD)
   */
  static calculateMoneyValueChange(
    vesAmount: number,
    currentRate: number,
    pastRate: number
  ): MoneyValueChange {
    if (!vesAmount || !currentRate || !pastRate || currentRate <= 0 || pastRate <= 0) {
      return { deltaUSD: 0, deltaVES: 0, percent: 0 };
    }

    const usdCurrent = vesAmount / currentRate;
    const usdPast = vesAmount / pastRate;
    const deltaUSD = usdCurrent - usdPast;
    const deltaVES = deltaUSD * currentRate;
    const percent = ((pastRate / currentRate) - 1) * 100;

    return { deltaUSD, deltaVES, percent };
  }
}
