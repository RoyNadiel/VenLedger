import React from 'react';
import type { TransactionType, ExchangeRates } from '../../shared/domain/types';
import type { Vault } from '../../vaults/domain/entities';
import { getCurrencySymbol } from '../../shared/domain/currencyUtils';

export interface TransactionFormProps {
  type: TransactionType;
  setType: (type: TransactionType) => void;
  vaultId: string;
  setVaultId: (id: string) => void;
  destinationVaultId: string;
  setDestinationVaultId: (id: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  destinationAmount: string;
  setDestinationAmount: (amount: string) => void;
  note: string;
  setNote: (note: string) => void;
  vaults: Vault[];
  rates: ExchangeRates | null;
  onSubmit: (e: React.FormEvent) => void;
  onAutoCalculateDest: () => void;
  onFillMax?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  setType,
  vaultId,
  setVaultId,
  destinationVaultId,
  setDestinationVaultId,
  amount,
  setAmount,
  destinationAmount,
  setDestinationAmount,
  note,
  setNote,
  vaults,
  rates,
  onSubmit,
  onAutoCalculateDest,
  onFillMax,
}) => {
  const isTransfer = type === 'transfer' || type === 'buy_sell';
  const sourceVault = vaults.find((v) => v.id === vaultId);
  const destVault = vaults.find((v) => v.id === destinationVaultId);
  const isDifferentCurrency =
    isTransfer &&
    sourceVault &&
    destVault &&
    sourceVault.currency !== destVault.currency;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
      <h2 className="text-sm font-bold text-slate-800 mb-3">Nuevo Movimiento</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Tipo de Operación
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="expense">Gasto (Salida)</option>
              <option value="income">Ingreso (Entrada)</option>
              <option value="transfer">
                Transferencia / Cambio entre Bóvedas
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {isTransfer ? 'Bóveda Origen (Sale)' : 'Bóveda'}
            </label>
            <select
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            >
              <option value="">Seleccionar bóveda...</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.currency})
                </option>
              ))}
            </select>
          </div>

          {isTransfer && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Bóveda Destino (Entra)
              </label>
              <select
                value={destinationVaultId}
                onChange={(e) => setDestinationVaultId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
                required
              >
                <option value="">Seleccionar destino...</option>
                {vaults
                  .filter((v) => v.id !== vaultId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.currency})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500">
                {isTransfer
                  ? `Monto Retirado (${sourceVault?.currency || 'Origen'})`
                  : 'Monto'}
              </label>
              {isTransfer && sourceVault && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(String(sourceVault.balance));
                    onFillMax?.();
                  }}
                  className="text-[10px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                  title={`Saldo disponible: ${sourceVault.balance}`}
                >
                  Máx
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            />
            {isTransfer && sourceVault && (
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Disponible en bóveda:</span>
                <span className={`font-semibold ${
                  sourceVault.balance <= 0 ? 'text-rose-500' : 'text-emerald-600'
                }`}>
                  {getCurrencySymbol(sourceVault.currency)}{' '}
                  {sourceVault.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {isDifferentCurrency && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Monto Recibido ({destVault?.currency})
                </label>
                {rates && (
                  <button
                    type="button"
                    onClick={onAutoCalculateDest}
                    className="text-[10px] text-sky-600 hover:underline cursor-pointer"
                  >
                    Calc. Tasa
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={destinationAmount}
                onChange={(e) => setDestinationAmount(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
                required
              />
            </div>
          )}

          <div className={isDifferentCurrency ? '' : 'sm:col-span-2'}>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Nota / Detalle
            </label>
            <input
              type="text"
              placeholder={
                isTransfer
                  ? 'Ej. Venta Binance P2P a Banco'
                  : 'Ej. Mercado, Pago servicio'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isTransfer
              ? 'Registrar Transferencia / Cambio'
              : 'Guardar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};
