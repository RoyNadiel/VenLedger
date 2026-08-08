import type { Currency, VaultType } from '../../shared/domain/types';

export interface Vault {
  id: string; // UUID v4
  userId?: string;
  name: string;
  type: VaultType;
  currency: Currency;
  balance: number;
  updatedAt: string;
}
