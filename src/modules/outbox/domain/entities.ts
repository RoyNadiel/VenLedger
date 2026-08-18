export type OutboxAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface OutboxEvent {
  id: string; // UUID v4
  table: string; // p.ej. 'vaults', 'transactions', 'debts', 'debt_payments'
  action: OutboxAction;
  payload: Record<string, unknown>;
  createdAt: string;
  synced: 0 | 1;
  syncedAt?: string;
  error?: string;
}
