import { create } from 'zustand';
import type { Debt, DebtPayment } from '../domain/entities';
import { dexieDebtRepository } from '../infrastructure/dexieDebtRepository';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';

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
    set({ debts, isLoading: false });
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
    await get().loadPaymentsForDebt(paymentData.debtId);
    await get().loadDebts();
    await useOutboxStore.getState().refreshOutboxState();
    return payment;
  },
}));
