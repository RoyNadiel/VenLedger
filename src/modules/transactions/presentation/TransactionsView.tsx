import React, { useState } from 'react';
import { useTransactionsStore } from './useTransactionsStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import type { TransactionType } from '../../shared/domain/types';
import { TransactionForm } from './TransactionForm';
import { TransactionItem } from './TransactionItem';

export const TransactionsView: React.FC = () => {
  const { transactions, createTransaction, deleteTransaction } =
    useTransactionsStore();
  const { vaults } = useVaultsStore();
  const { rates } = useRatesStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [vaultId, setVaultId] = useState('');
  const [destinationVaultId, setDestinationVaultId] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAmount, setDestinationAmount] = useState('');
  const [note, setNote] = useState('');
  const [filterVaultId, setFilterVaultId] = useState('');

  const isTransfer = type === 'transfer' || type === 'buy_sell';
  const sourceVault = vaults.find((v) => v.id === vaultId);
  const destVault = vaults.find((v) => v.id === destinationVaultId);

  const isDifferentCurrency =
    isTransfer &&
    sourceVault &&
    destVault &&
    sourceVault.currency !== destVault.currency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const selectedVault = sourceVault || vaults[0];

    if (!selectedVault || isNaN(numAmount) || numAmount <= 0) return;

    if (isTransfer) {
      if (!destinationVaultId || destinationVaultId === selectedVault.id) {
        alert('Selecciona una bóveda de destino diferente a la de origen.');
        return;
      }

      let numDestAmount = parseFloat(destinationAmount);
      if (isDifferentCurrency) {
        if (isNaN(numDestAmount) || numDestAmount <= 0) {
          alert('Ingresa el monto recibido en la bóveda de destino.');
          return;
        }
      } else {
        numDestAmount = numAmount;
      }

      await createTransaction({
        vaultId: selectedVault.id,
        destinationVaultId,
        amount: numAmount,
        destinationAmount: numDestAmount,
        currency: selectedVault.currency,
        type,
        note:
          note || `Transferencia de ${selectedVault.name} a ${destVault?.name}`,
      });
    } else {
      await createTransaction({
        vaultId: selectedVault.id,
        amount: numAmount,
        currency: selectedVault.currency,
        type,
        note,
      });
    }

    setAmount('');
    setDestinationAmount('');
    setNote('');
  };

  const handleAutoCalculateDest = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !sourceVault || !destVault || !rates) return;

    const getRateInVES = (curr: string) => {
      switch (curr) {
        case 'VES':
          return 1;
        case 'USD':
          return rates.usd_official || 1;
        case 'USDT':
          return rates.usd_libre || 1;
        case 'EUR':
          return rates.eur_official || 1;
        default:
          return 1;
      }
    };

    const amountInVES = numAmount * getRateInVES(sourceVault.currency);
    const destRateInVES = getRateInVES(destVault.currency);
    const calculatedDestAmount =
      destRateInVES > 0 ? amountInVES / destRateInVES : 0;

    setDestinationAmount(calculatedDestAmount.toFixed(2));
  };

  const filteredTxs = filterVaultId
    ? transactions.filter(
        (tx) =>
          tx.vaultId === filterVaultId ||
          tx.destinationVaultId === filterVaultId
      )
    : transactions;

  return (
    <div className="space-y-4">
      {/* Formulario de Registro Rápido */}
      <TransactionForm
        type={type}
        setType={setType}
        vaultId={vaultId}
        setVaultId={setVaultId}
        destinationVaultId={destinationVaultId}
        setDestinationVaultId={setDestinationVaultId}
        amount={amount}
        setAmount={setAmount}
        destinationAmount={destinationAmount}
        setDestinationAmount={setDestinationAmount}
        note={note}
        setNote={setNote}
        vaults={vaults}
        rates={rates}
        onSubmit={(e) => void handleSubmit(e)}
        onAutoCalculateDest={handleAutoCalculateDest}
      />

      {/* Historial de Movimientos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Historial Reciente
          </h2>
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">
              Filtrar:
            </label>
            <select
              value={filterVaultId}
              onChange={(e) => setFilterVaultId(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="">Todas las bóvedas</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No hay movimientos registrados para el filtro seleccionado.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
            {filteredTxs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                vaults={vaults}
                filterVaultId={filterVaultId}
                onDelete={(id) => void deleteTransaction(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
