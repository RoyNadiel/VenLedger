import type { AgreementType, Currency, DebtStatus, DebtType } from '../../shared/domain/types';

export interface Debt {
  id: string; // UUID v4
  userId?: string;
  contactName: string;
  contactPhone?: string;
  totalAmount: number;
  currency: Currency;
  type: DebtType;
  agreementType: AgreementType;
  status: DebtStatus;
  createdAt: string;
  dueDate?: string;
  note?: string;
}

export interface DebtPayment {
  id: string; // UUID v4
  debtId: string; // UUID v4
  amount: number;
  currency: Currency;
  rateUsed: number;          // Tasa de la moneda del pago → VES
  rateType: 'bcv' | 'libre';
  vaultId?: string;          // Bóveda asociada donde entra o sale el dinero
  createdAt: string;
  note?: string;
}
