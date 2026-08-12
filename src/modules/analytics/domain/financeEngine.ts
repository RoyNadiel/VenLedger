import type { Vault } from '../../vaults/domain/entities';
import type { Debt, DebtPayment } from '../../debts/domain/entities';
import type { AgreementType, ExchangeRates } from '../../shared/domain/types';

export interface ConsolidatedBalance {
  totalVES: number; // Total patrimonio en Bolívares
  totalUSD: number; // Equivalente total en USD (Tasa BCV)
  totalUSDT: number; // Equivalente total en USDT (Tasa P2P)
  totalEUR: number; // Equivalente total en EUR (Tasa BCV Euro)
  totalVES_Official: number; // Para compatibilidad
  totalVES_Libre: number; // Para compatibilidad
  vaultBreakdown: Array<{
    vaultId: string;
    vaultName: string;
    originalBalance: number;
    originalCurrency: string;
    equivalentVES: number;
    equivalentUSD: number;
    equivalentUSDT: number;
  }>;
}

export interface DebtCalculationResult {
  debtId: string;
  contactName: string;
  agreementType: AgreementType;
  originalAmount: number;
  currency: string;
  totalPaidUSDT: number;
  totalPaidVES: number;
  remainingAmountUSDT: number;
  remainingAmountVES_Official: number;
  remainingAmountVES_Libre: number;
  remainingAmountOriginal: number;
  isFullyPaid: boolean;
}

export interface PurchasingPowerMetric {
  usdtBalance: number;
  currentValueInVES: number;
  historicalValueInVES: number;
  percentageChange: number;
  status: 'gained' | 'lost' | 'neutral';
}

export class FinanceEngine {
  /**
   * Calcula el saldo total consolidado usando el Bolívar (VES) como moneda pivote central.
   * Convierte cada bóveda a VES según su tasa correspondiente y calcula equivalentes en USD, USDT y EUR.
   */
  static calculateConsolidatedBalance(
    vaults: Vault[],
    rates: ExchangeRates
  ): ConsolidatedBalance {
    let totalVES = 0;

    const vaultBreakdown = vaults.map((vault) => {
      let equivalentVES = 0;

      switch (vault.currency) {
        case 'VES':
          equivalentVES = vault.balance;
          break;
        case 'USD':
          equivalentVES = vault.balance * (rates.usd_official || 0);
          break;
        case 'USDT':
          equivalentVES = vault.balance * (rates.usd_libre || 0);
          break;
        case 'EUR':
          equivalentVES = vault.balance * (rates.eur_official || 0);
          break;
      }

      totalVES += equivalentVES;

      const equivalentUSD =
        rates.usd_official > 0 ? equivalentVES / rates.usd_official : 0;
      const equivalentUSDT =
        rates.usd_libre > 0 ? equivalentVES / rates.usd_libre : 0;

      return {
        vaultId: vault.id,
        vaultName: vault.name,
        originalBalance: vault.balance,
        originalCurrency: vault.currency,
        equivalentVES: Number(equivalentVES.toFixed(2)),
        equivalentUSD: Number(equivalentUSD.toFixed(2)),
        equivalentUSDT: Number(equivalentUSDT.toFixed(2)),
      };
    });

    const totalUSD = rates.usd_official > 0 ? totalVES / rates.usd_official : 0;
    const totalUSDT = rates.usd_libre > 0 ? totalVES / rates.usd_libre : 0;
    const totalEUR = rates.eur_official > 0 ? totalVES / rates.eur_official : 0;

    return {
      totalVES: Number(totalVES.toFixed(2)),
      totalUSD,
      totalUSDT,
      totalEUR,
      totalVES_Official: Number(totalVES.toFixed(2)),
      totalVES_Libre: Number(totalVES.toFixed(2)),
      vaultBreakdown,
    };
  }

  /**
   * Recalcula el saldo restante de una deuda considerando abonos parciales y brecha cambiaria.
   * Soporta cualquier combinación de monedas (USD, EUR, USDT, VES).
   */
  static calculateDebtBalance(
    debt: Debt,
    payments: DebtPayment[],
    currentRates: ExchangeRates
  ): DebtCalculationResult {
    const getRateInVES = (curr: string, paymentRateUsed?: number) => {
      if (curr === 'VES') return 1;
      if (paymentRateUsed && paymentRateUsed > 0) return paymentRateUsed;
      switch (curr) {
        case 'VES':
          return 1;
        case 'USD':
          return currentRates.usd_official || 1;
        case 'USDT':
          return currentRates.usd_libre || 1;
        case 'EUR':
          return currentRates.eur_official || 1;
        default:
          return 1;
      }
    };

    let totalPaidVES = 0;
    let totalPaidUSDT = 0;

    payments.forEach((payment) => {
      const paymentRateInVES = getRateInVES(payment.currency, payment.rateUsed);
      const paidVES = payment.amount * paymentRateInVES;
      totalPaidVES += paidVES;
      // Usar la tasa P2P del momento del pago para obtener el equivalente USDT real.
      // usdLibreAtPayment es el campo canónico; rateUsed es fallback para pagos anteriores
      // en los que la moneda era VES o USDT (donde rateUsed === usd_libre).
      const libreRate = payment.usdLibreAtPayment > 0
        ? payment.usdLibreAtPayment
        : (currentRates.usd_libre || 1);
      totalPaidUSDT += paidVES / libreRate;
    });

    const debtRateInVES = getRateInVES(debt.currency);
    const originalVES = debt.totalAmount * debtRateInVES;

    // Para fixed_usdt: comparar directamente en USDT — la deuda está congelada en esa unidad.
    // Para floating_ves: comparar en VES — el valor de la deuda sigue a la tasa oficial.
    let remainingAmountOriginal: number;
    let remainingAmountUSDT: number;
    let remainingAmountVES_Official: number;
    let remainingAmountVES_Libre: number;
    let isFullyPaid: boolean;

    if (debt.agreementType === 'fixed_usdt') {
      const remainingUSDT = Math.max(0, debt.totalAmount - totalPaidUSDT);
      isFullyPaid = remainingUSDT <= 0.05; // tolerancia de 5 centavos
      remainingAmountOriginal = remainingUSDT;
      remainingAmountUSDT = remainingUSDT;
      remainingAmountVES_Official = remainingUSDT * (currentRates.usd_official || 1);
      remainingAmountVES_Libre = remainingUSDT * (currentRates.usd_libre || 1);
    } else {
      // floating_ves: comparar en VES
      const remainingVES = Math.max(0, originalVES - totalPaidVES);
      isFullyPaid = remainingVES <= 0.5;
      remainingAmountOriginal = debtRateInVES > 0 ? remainingVES / debtRateInVES : 0;
      remainingAmountUSDT = (currentRates.usd_libre || 1) > 0 ? remainingVES / currentRates.usd_libre : 0;
      remainingAmountVES_Official = remainingAmountUSDT * (currentRates.usd_official || 1);
      remainingAmountVES_Libre = remainingAmountUSDT * (currentRates.usd_libre || 1);
    }

    return {
      debtId: debt.id,
      contactName: debt.contactName,
      agreementType: debt.agreementType,
      originalAmount: debt.totalAmount,
      currency: debt.currency,
      totalPaidUSDT: Number(totalPaidUSDT.toFixed(2)),
      totalPaidVES: Number(totalPaidVES.toFixed(2)),
      remainingAmountUSDT: Number(remainingAmountUSDT.toFixed(2)),
      remainingAmountVES_Official: Number(
        remainingAmountVES_Official.toFixed(2)
      ),
      remainingAmountVES_Libre: Number(remainingAmountVES_Libre.toFixed(2)),
      remainingAmountOriginal: Number(remainingAmountOriginal.toFixed(2)),
      isFullyPaid,
    };
  }

  /**
   * Evalúa si los fondos guardados en USDT ganaron o perdieron poder de compra frente al diferencial cambiario.
   */
  static calculatePurchasingPower(
    usdtBalance: number,
    initialRateP2P: number,
    currentRateP2P: number
  ): PurchasingPowerMetric {
    const historicalValueInVES = usdtBalance * initialRateP2P;
    const currentValueInVES = usdtBalance * currentRateP2P;

    const difference = currentValueInVES - historicalValueInVES;
    const percentageChange =
      historicalValueInVES > 0 ? (difference / historicalValueInVES) * 100 : 0;

    let status: 'gained' | 'lost' | 'neutral' = 'neutral';
    if (percentageChange > 0.5) status = 'gained';
    else if (percentageChange < -0.5) status = 'lost';

    return {
      usdtBalance,
      currentValueInVES: Number(currentValueInVES.toFixed(2)),
      historicalValueInVES: Number(historicalValueInVES.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(2)),
      status,
    };
  }
}
