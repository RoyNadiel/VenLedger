import type { Currency, TransactionType } from '../../shared/domain/types';

export interface Transaction {
  id: string; // UUID v4
  userId?: string;
  vaultId: string; // UUID v4 (Bóveda Origen)
  destinationVaultId?: string; // Para transferencias o cambios de divisas
  amount: number;
  destinationAmount?: number; // Monto percibido en destino (si varía la divisa)
  currency: Currency;
  type: TransactionType;
  categoryId?: string; // UUID v4
  rateUsed?: number;
  fee?: number; // Comisión bancaria / Pago Móvil (ej. BDV, IGTF)
  note?: string;
  createdAt: string;
}
