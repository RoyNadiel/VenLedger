import type { Vault } from '../../vaults/domain/entities';
import type { Debt, DebtPayment } from '../../debts/domain/entities';
import type { ExchangeRates } from '../../shared/domain/types';

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
  agreementType: 'fixed_usdt' | 'floating_ves';
  originalAmount: number;
  currency: string;
  totalPaidUSDT: number;
  totalPaidVES: number;
  remainingAmountUSDT: number;
  remainingAmountVES_Official: number;
  remainingAmountVES_Libre: number;
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

    const totalUSD =
      rates.usd_official > 0 ? totalVES / rates.usd_official : 0;
    const totalUSDT =
      rates.usd_libre > 0 ? totalVES / rates.usd_libre : 0;
    const totalEUR =
      rates.eur_official > 0 ? totalVES / rates.eur_official : 0;

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
   */
  static calculateDebtBalance(
    debt: Debt,
    payments: DebtPayment[],
    currentRates: ExchangeRates
  ): DebtCalculationResult {
    let totalPaidUSDT = 0;
    let totalPaidVES = 0;

    payments.forEach((payment) => {
      if (payment.currency === 'USDT' || payment.currency === 'USD') {
        totalPaidUSDT += payment.amount;
        const effectiveRate =
          debt.agreementType === 'floating_ves'
            ? payment.rateType === 'bcv'
              ? payment.rateUsed
              : currentRates.usd_official
            : payment.rateUsed;
        totalPaidVES += payment.amount * effectiveRate;
      } else if (payment.currency === 'VES') {
        totalPaidVES += payment.amount;
        totalPaidUSDT +=
          payment.rateUsed > 0 ? payment.amount / payment.rateUsed : 0;
      }
    });

    let remainingAmountUSDT = 0;

    if (debt.agreementType === 'fixed_usdt') {
      const originalUSDT =
        debt.currency === 'VES'
          ? currentRates.usd_libre > 0
            ? debt.totalAmount / currentRates.usd_libre
            : 0
          : debt.totalAmount;
      remainingAmountUSDT = Math.max(0, originalUSDT - totalPaidUSDT);
    } else {
      // floating_ves
      const originalVES =
        debt.currency === 'VES'
          ? debt.totalAmount
          : debt.totalAmount * currentRates.usd_official;
      const remainingVES = Math.max(0, originalVES - totalPaidVES);
      remainingAmountUSDT =
        currentRates.usd_official > 0
          ? remainingVES / currentRates.usd_official
          : 0;
    }

    const remainingAmountVES_Official =
      remainingAmountUSDT * currentRates.usd_official;
    const remainingAmountVES_Libre =
      remainingAmountUSDT * currentRates.usd_libre;
    const isFullyPaid = remainingAmountUSDT <= 0.01;

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
