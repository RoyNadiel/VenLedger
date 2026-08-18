import Dexie, { type Table } from 'dexie';
import type { Vault } from '../../../vaults/domain/entities';
import type { Category } from '../../../categories/domain/entities';
import type { Transaction } from '../../../transactions/domain/entities';
import type { Debt, DebtPayment } from '../../../debts/domain/entities';
import type { OutboxEvent } from '../../../outbox/domain/entities';
import type { ExchangeRates } from '../../domain/types';

export interface ExchangeRatesCacheRecord {
  key: string; // 'latest'
  rates: ExchangeRates;
  fetchedAt: string; // Fecha en que la app hizo el fetch
  rateTimestamp?: string; // Fecha oficial emitida por el BCV / API
}

export interface RateHistoryRecord {
  date: string; // 'YYYY-MM-DD'
  usd_official: number;
  eur_official: number;
  usd_libre: number;
  timestamp?: string;
}

export class VenLedgerDatabase extends Dexie {
  vaults!: Table<Vault, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  debts!: Table<Debt, string>;
  debtPayments!: Table<DebtPayment, string>;
  outboxEvents!: Table<OutboxEvent, string>;
  exchangeRatesCache!: Table<ExchangeRatesCacheRecord, string>;
  rateHistory!: Table<RateHistoryRecord, string>;

  constructor() {
    super('VenLedgerDatabase');

    this.version(1).stores({
      vaults: 'id, type, currency, updatedAt',
      categories: 'id, type, name',
      transactions: 'id, vaultId, categoryId, type, createdAt',
      debts: 'id, type, status, createdAt',
      debtPayments: 'id, debtId, createdAt',
      outboxEvents: 'id, synced, createdAt, table',
      exchangeRatesCache: 'key',
    });

    this.version(2).stores({
      rateHistory: 'date',
    });
  }
}

export const db = new VenLedgerDatabase();
