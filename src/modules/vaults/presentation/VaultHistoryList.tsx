import React from 'react';
import type { Vault } from '../domain/entities';
import type { Transaction } from '../../transactions/domain/entities';

export interface VaultHistoryListProps {
  vault: Vault;
  transactions: Transaction[];
  vaults: Vault[];
}

export const VaultHistoryList: React.FC<VaultHistoryListProps> = ({
  vault,
  transactions,
  vaults,
}) => {
  const vaultTxs = transactions.filter(
    (t) => t.vaultId === vault.id || t.destinationVaultId === vault.id
  );

  if (vaultTxs.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-2">
        Sin movimientos registrados para esta bóveda.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
      {vaultTxs.slice(0, 10).map((tx) => {
        const isIncomingTransfer = tx.destinationVaultId === vault.id;
        const isOutgoingTransfer =
          tx.vaultId === vault.id &&
          (tx.type === 'transfer' || tx.type === 'buy_sell');
        const source = vaults.find((v) => v.id === tx.vaultId);
        const dest = vaults.find((v) => v.id === tx.destinationVaultId);

        let detailText = tx.note || '';
        if (!detailText) {
          if (isIncomingTransfer)
            detailText = `Recibido de ${source?.name || 'Bóveda'}`;
          else if (isOutgoingTransfer)
            detailText = `Enviado a ${dest?.name || 'Bóveda'}`;
          else if (tx.type === 'income') detailText = 'Ingreso';
          else detailText = 'Gasto';
        }

        let amountDisplay = '';
        let amountColor = 'text-slate-800';

        if (isIncomingTransfer) {
          const receivedAmt = tx.destinationAmount ?? tx.amount;
          amountDisplay = `+${vault.currency === 'VES' ? 'Bs.' : '$'} ${receivedAmt.toFixed(2)}`;
          amountColor = 'text-emerald-600 font-bold';
        } else if (isOutgoingTransfer) {
          amountDisplay = `-${vault.currency === 'VES' ? 'Bs.' : '$'} ${tx.amount.toFixed(2)}`;
          amountColor = 'text-amber-700 font-bold';
        } else if (tx.type === 'income') {
          amountDisplay = `+${vault.currency === 'VES' ? 'Bs.' : '$'} ${tx.amount.toFixed(2)}`;
          amountColor = 'text-emerald-600 font-bold';
        } else {
          amountDisplay = `-${vault.currency === 'VES' ? 'Bs.' : '$'} ${tx.amount.toFixed(2)}`;
          amountColor = 'text-slate-900 font-bold';
        }

        return (
          <div
            key={tx.id}
            className="text-xs flex items-center justify-between py-1 border-b border-slate-50 last:border-0"
          >
            <div className="min-w-0 pr-2">
              <div className="font-medium text-slate-700 truncate">
                {detailText}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                {isIncomingTransfer && `De: ${source?.name} • `}
                {isOutgoingTransfer && `A: ${dest?.name} • `}
                {new Date(tx.createdAt).toLocaleDateString()}{' '}
                {new Date(tx.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className={`shrink-0 ${amountColor}`}>{amountDisplay}</div>
          </div>
        );
      })}
    </div>
  );
};
