import { create } from 'zustand';
import type { Debt, DebtPayment } from '../domain/entities';
import type { DebtStatus } from '../../shared/domain/types';
import { dexieDebtRepository } from '../infrastructure/dexieDebtRepository';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { FinanceEngine } from '../../analytics/domain/financeEngine';

interface DebtsState {
  debts: Debt[];
  paymentsByDebtId: Record<string, DebtPayment[]>;
  isLoading: boolean;
  loadDebts: () => Promise<void>;
  loadPaymentsForDebt: (debtId: string) => Promise<void>;
  createDebt: (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<Debt>;
  addPayment: (paymentData: Omit<DebtPayment, 'id' | 'createdAt'>) => Promise<DebtPayment>;
  markDebtStatus: (debtId: string, status: DebtStatus) => Promise<void>;
}

export const useDebtsStore = create<DebtsState>((set, get) => ({
  debts: [],
  paymentsByDebtId: {},
  isLoading: false,
  loadDebts: async () => {
    set({ isLoading: true });
    const debts = await dexieDebtRepository.getAllDebts();
    const paymentsByDebtId: Record<string, DebtPayment[]> = {};
    for (const debt of debts) {
      paymentsByDebtId[debt.id] = await dexieDebtRepository.getPaymentsByDebtId(debt.id);
    }
    set({ debts, paymentsByDebtId, isLoading: false });
  },
  loadPaymentsForDebt: async (debtId) => {
    const payments = await dexieDebtRepository.getPaymentsByDebtId(debtId);
    set((state) => ({
      paymentsByDebtId: {
        ...state.paymentsByDebtId,
        [debtId]: payments,
      },
    }));
  },
  createDebt: async (debtData) => {
    const newDebt = await dexieDebtRepository.createDebt(debtData);
    await get().loadDebts();
    await useOutboxStore.getState().refreshOutboxState();
    return newDebt;
  },
  addPayment: async (paymentData) => {
    const payment = await dexieDebtRepository.addPayment(paymentData);

    const debt = get().debts.find((d) => d.id === paymentData.debtId);
    if (debt) {
      // Registrar movimiento en el historial siempre.
      // Si no se seleccionó bóveda, vaultId queda vacío y no afecta ningún saldo.
      const isReceivable = debt.type === 'receivable';
      await useTransactionsStore.getState().createTransaction({
        vaultId: paymentData.vaultId ?? '',
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: isReceivable ? 'income' : 'expense',
        fee: paymentData.fee,
        note: isReceivable
          ? `Abono de deuda: ${debt.contactName}`
          : `Pago de deuda a: ${debt.contactName}`,
      });

      // Evaluar si la deuda quedó completada automáticamente
      const rates = useRatesStore.getState().rates;
      const allPayments = await dexieDebtRepository.getPaymentsByDebtId(debt.id);
      if (rates) {
        const calc = FinanceEngine.calculateDebtBalance(debt, allPayments, rates);
        const newStatus: DebtStatus = calc.isFullyPaid
          ? 'paid'
          : allPayments.length > 0
            ? 'partially_paid'
            : 'pending';
        if (debt.status !== newStatus) {
          await dexieDebtRepository.updateDebtStatus(debt.id, newStatus);
        }
      }
    }

    await get().loadPaymentsForDebt(paymentData.debtId);
    await get().loadDebts();
    await useOutboxStore.getState().refreshOutboxState();
    return payment;
  },
  markDebtStatus: async (debtId, status) => {
    await dexieDebtRepository.updateDebtStatus(debtId, status);
    await get().loadDebts();
    await useOutboxStore.getState().refreshOutboxState();
  },
}));
