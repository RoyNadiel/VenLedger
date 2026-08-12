import React from 'react';
import type { Transaction } from '../domain/entities';
import type { Vault } from '../../vaults/domain/entities';
import { ArrowLeftRight, Minus, MoveDown, MoveUp, Plus, X } from 'lucide-react';

export interface TransactionItemProps {
  transaction: Transaction;
  vaults: Vault[];
  filterVaultId: string;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction: tx,
  vaults,
  filterVaultId,
  onDelete,
}) => {
  const vault = vaults.find((v) => v.id === tx.vaultId);
  const dest = vaults.find((v) => v.id === tx.destinationVaultId);
  const isIncome = tx.type === 'income';
  const isTxTransfer = tx.type === 'transfer' || tx.type === 'buy_sell';

  const isFilteredVaultDest =
    filterVaultId && isTxTransfer && tx.destinationVaultId === filterVaultId;
  const isFilteredVaultSource =
    filterVaultId && isTxTransfer && tx.vaultId === filterVaultId;

  let iconSymbol = isIncome ? (
    <Plus className="w-4 h-4" />
  ) : (
    <Minus className="w-4 h-4" />
  );
  let iconClass = isIncome
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700';

  if (isTxTransfer) {
    if (isFilteredVaultDest) {
      iconSymbol = <MoveDown className="w-4 h-4" />;
      iconClass = 'bg-emerald-100 text-emerald-700';
    } else if (isFilteredVaultSource) {
      iconSymbol = <MoveUp className="w-4 h-4" />;
      iconClass = 'bg-amber-100 text-amber-700';
    } else {
      iconSymbol = <ArrowLeftRight className="w-4 h-4" />;
      iconClass = 'bg-sky-100 text-sky-700';
    }
  }

  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <div className="flex items-center space-x-3 min-w-0">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${iconClass}`}
        >
          {iconSymbol}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">
            {tx.note ||
              (isTxTransfer
                ? isFilteredVaultDest
                  ? `Recibido de ${vault?.name || 'Bóveda'}`
                  : `Enviado a ${dest?.name || 'Bóveda'}`
                : isIncome
                  ? 'Ingreso registrado'
                  : 'Gasto registrado')}
          </div>
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1 mt-0.5">
            {isTxTransfer ? (
              <span className="font-semibold text-slate-600">
                {vault?.name || 'Bóveda'} ➔ {dest?.name || 'Destino'}
              </span>
            ) : (
              <span className="font-semibold text-slate-600">
                {vault?.name ?? (tx.vaultId ? 'Bóveda' : 'Externo')}
              </span>
            )}
            <span>•</span>
            <span>
              {new Date(tx.createdAt).toLocaleDateString()}{' '}
              {new Date(tx.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="text-right">
          {isTxTransfer ? (
            isFilteredVaultDest ? (
              <span className="text-sm font-bold text-emerald-600">
                +{dest?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                {(tx.destinationAmount ?? tx.amount).toFixed(2)}
              </span>
            ) : isFilteredVaultSource ? (
              <span className="text-sm font-bold text-amber-700">
                -{vault?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                {tx.amount.toFixed(2)}
              </span>
            ) : (
              <div className="flex flex-col items-end text-xs">
                <span className="font-bold text-slate-700">
                  -{vault?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                  {tx.amount.toFixed(2)}
                </span>
                <span className="font-bold text-emerald-600">
                  +{dest?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                  {(tx.destinationAmount ?? tx.amount).toFixed(2)}
                </span>
              </div>
            )
          ) : (
            <span
              className={`text-sm font-bold ${
                isIncome ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {isIncome ? '+' : '-'}
              {tx.currency === 'VES' ? 'Bs.' : '$'} {tx.amount.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(tx.id)}
          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
          title="Eliminar movimiento"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
