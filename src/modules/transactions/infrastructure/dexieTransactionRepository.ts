import { db } from '../../shared/infrastructure/dexie/db';
import type { Transaction } from '../domain/entities';
import { outboxQueueService } from '../../outbox/application/outboxQueueService';

export class DexieTransactionRepository {
  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy('createdAt').reverse().toArray();
  }

  async getByVaultId(vaultId: string): Promise<Transaction[]> {
    const txs = await db.transactions
      .filter((t) => t.vaultId === vaultId || t.destinationVaultId === vaultId)
      .toArray();
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<Transaction> {
    const transaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await db.transactions.add(transaction);
    await outboxQueueService.recordEvent(
      'transactions',
      'INSERT',
      transaction as unknown as Record<string, unknown>
    );
    return transaction;
  }

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
    await outboxQueueService.recordEvent('transactions', 'DELETE', { id });
  }
}

export const dexieTransactionRepository = new DexieTransactionRepository();
