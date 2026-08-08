export type Currency = 'USDT' | 'USD' | 'EUR' | 'VES';

export type AgreementType = 'fixed_usdt' | 'floating_ves';

export type TransactionType =
  | 'transfer'
  | 'buy_sell'
  | 'expense'
  | 'income'
  | 'debt_receivable'
  | 'debt_payable';

export type DebtType = 'receivable' | 'payable';

export type DebtStatus = 'pending' | 'partially_paid' | 'paid';

export type VaultType = 'binance' | 'cash' | 'bank';

export interface ExchangeRates {
  usd_official: number; // Tasa BCV (Bs por USD)
  eur_official: number; // Tasa Euro BCV (Bs por EUR)
  usd_libre: number;    // Tasa P2P Binance (Bs por USDT)
  timestamp: string;
}
