import type { Vault } from '../../vaults/domain/entities';
import type { Debt, DebtPayment } from '../../debts/domain/entities';
import type { AgreementType, ExchangeRates } from '../../shared/domain/types';
import { getRateInVES } from '../../shared/domain/currencyUtils';

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
  totalPaidInDebtCurrency: number;
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
   * Consolida todos los saldos en VES, USD, USDT y EUR usando las tasas del día.
   */
  static calculateConsolidatedBalance(
    vaults: Vault[],
    rates: ExchangeRates
  ): ConsolidatedBalance {
    let totalVES = 0;

    const vaultBreakdown = vaults.map((vault) => {
      const rateInVES = getRateInVES(vault.currency, rates);
      const equivalentVES = vault.balance * rateInVES;
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
   * Soporta cualquier combinación de monedas de forma completamente neutra (USD BCV, EUR BCV, USDT P2P, VES).
   */
  static calculateDebtBalance(
    debt: Debt,
    payments: DebtPayment[],
    currentRates: ExchangeRates
  ): DebtCalculationResult {
    let totalPaidVES = 0;
    let totalPaidInDebtCurrency = 0;
    let totalPaidUSDT = 0;

    payments.forEach((payment) => {
      const paymentRateInVES = getRateInVES(payment.currency, currentRates, payment.rateUsed);
      const paidVES = payment.amount * paymentRateInVES;
      totalPaidVES += paidVES;

      // 1. Acumulamos lo pagado en la moneda original de la deuda
      if (payment.currency === debt.currency) {
        totalPaidInDebtCurrency += payment.amount;
      } else {
        switch (debt.currency) {
          case 'USD':
            totalPaidInDebtCurrency += (currentRates.usd_official > 0 ? paidVES / currentRates.usd_official : payment.amount);
            break;
          case 'EUR':
            totalPaidInDebtCurrency += (currentRates.eur_official > 0 ? paidVES / currentRates.eur_official : payment.amount);
            break;
          case 'USDT':
            totalPaidInDebtCurrency += (currentRates.usd_libre > 0 ? paidVES / currentRates.usd_libre : payment.amount);
            break;
          case 'VES':
          default:
            totalPaidInDebtCurrency += paidVES;
            break;
        }
      }

      // 2. Acumulamos el equivalente en USDT para fines informativos y de compras
      const libreRate = payment.currency === 'USDT' && payment.rateUsed > 0
        ? payment.rateUsed
        : (currentRates.usd_libre || 1);
      totalPaidUSDT += paidVES / libreRate;
    });

    const debtRateInVES = getRateInVES(debt.currency, currentRates);
    const originalVES = debt.totalAmount * debtRateInVES;

    let remainingAmountOriginal: number;
    let remainingAmountUSDT: number;
    let remainingAmountVES_Official: number;
    let remainingAmountVES_Libre: number;
    let isFullyPaid: boolean;

    if (debt.agreementType === 'fixed_usdt') {
      // Deuda congelada en la divisa original de la deuda (USD, EUR, USDT o VES)
      remainingAmountOriginal = Math.max(0, debt.totalAmount - totalPaidInDebtCurrency);
      isFullyPaid = remainingAmountOriginal <= 0.05; // tolerancia de 5 centavos

      const remainingVES = remainingAmountOriginal * debtRateInVES;
      remainingAmountVES_Official = remainingVES;
      remainingAmountVES_Libre = remainingVES;
      remainingAmountUSDT = (currentRates.usd_libre || 1) > 0
        ? remainingVES / currentRates.usd_libre
        : remainingAmountOriginal;
    } else {
      // floating_ves: comparar en VES (el valor en bolívares sigue flotando a la tasa oficial/libre del día)
      const remainingVES = Math.max(0, originalVES - totalPaidVES);
      isFullyPaid = remainingVES <= 0.5;

      remainingAmountOriginal = debtRateInVES > 0 ? remainingVES / debtRateInVES : 0;
      remainingAmountUSDT = (currentRates.usd_libre || 1) > 0 ? remainingVES / currentRates.usd_libre : 0;
      remainingAmountVES_Official = remainingVES;
      remainingAmountVES_Libre = remainingVES;
    }

    return {
      debtId: debt.id,
      contactName: debt.contactName,
      agreementType: debt.agreementType,
      originalAmount: debt.totalAmount,
      currency: debt.currency,
      totalPaidInDebtCurrency: Number(totalPaidInDebtCurrency.toFixed(2)),
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
    historicalRateVES: number,
    currentRates: ExchangeRates
  ): PurchasingPowerMetric {
    const historicalValueInVES = usdtBalance * historicalRateVES;
    const currentValueInVES = usdtBalance * currentRates.usd_official;

    const percentageChange =
      historicalValueInVES > 0
        ? ((currentValueInVES - historicalValueInVES) / historicalValueInVES) *
          100
        : 0;

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
