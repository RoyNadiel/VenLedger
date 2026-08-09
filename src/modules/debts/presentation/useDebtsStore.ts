import { create } from 'zustand';
import type { Debt, DebtPayment } from '../domain/entities';
import { dexieDebtRepository } from '../infrastructure/dexieDebtRepository';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';

interface DebtsState {
  debts: Debt[];
  paymentsByDebtId: Record<string, DebtPayment[]>;
  isLoading: boolean;
  loadDebts: () => Promise<void>;
  loadPaymentsForDebt: (debtId: string) => Promise<void>;
  createDebt: (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<Debt>;
  addPayment: (paymentData: Omit<DebtPayment, 'id' | 'createdAt'>) => Promise<DebtPayment>;
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

    // Si se especificó una bóveda, crear movimiento en esa bóveda
    if (paymentData.vaultId) {
      const debt = get().debts.find((d) => d.id === paymentData.debtId);
      if (debt) {
        const isReceivable = debt.type === 'receivable';
        await useTransactionsStore.getState().createTransaction({
          vaultId: paymentData.vaultId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          type: isReceivable ? 'income' : 'expense',
          note: isReceivable
            ? `Abono de deuda: ${debt.contactName}`
            : `Pago de deuda a: ${debt.contactName}`,
        });
      }
    }

    await get().loadPaymentsForDebt(paymentData.debtId);
    await get().loadDebts();
    await useOutboxStore.getState().refreshOutboxState();
    return payment;
  },
}));
