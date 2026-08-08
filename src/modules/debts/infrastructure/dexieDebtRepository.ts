import { db } from '../../shared/infrastructure/dexie/db';
import type { Debt, DebtPayment } from '../domain/entities';
import { outboxQueueService } from '../../outbox/application/outboxQueueService';

export class DexieDebtRepository {
  async getAllDebts(): Promise<Debt[]> {
    return await db.debts.orderBy('createdAt').reverse().toArray();
  }

  async getDebtById(id: string): Promise<Debt | undefined> {
    return await db.debts.get(id);
  }

  async createDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>): Promise<Debt> {
    const debt: Debt = {
      ...debtData,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await db.debts.add(debt);
    await outboxQueueService.recordEvent(
      'debts',
      'INSERT',
      debt as unknown as Record<string, unknown>
    );
    return debt;
  }

  async updateDebtStatus(id: string, status: Debt['status']): Promise<void> {
    await db.debts.update(id, { status });
    await outboxQueueService.recordEvent('debts', 'UPDATE', { id, status });
  }

  async getPaymentsByDebtId(debtId: string): Promise<DebtPayment[]> {
    return await db.debtPayments
      .where('debtId')
      .equals(debtId)
      .sortBy('createdAt');
  }

  async addPayment(
    paymentData: Omit<DebtPayment, 'id' | 'createdAt'>
  ): Promise<DebtPayment> {
    const payment: DebtPayment = {
      ...paymentData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await db.debtPayments.add(payment);
    await outboxQueueService.recordEvent(
      'debt_payments',
      'INSERT',
      payment as unknown as Record<string, unknown>
    );
    return payment;
  }
}

export const dexieDebtRepository = new DexieDebtRepository();
