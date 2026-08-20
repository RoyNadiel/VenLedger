import React, { useState } from 'react';
import { useTransactionsStore } from './useTransactionsStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { useCategoriesStore } from '../../categories/presentation/useCategoriesStore';
import type { TransactionType } from '../../shared/domain/types';
import { TransactionForm } from './TransactionForm';
import { TransactionItem } from './TransactionItem';
import { convertCurrency } from '../../shared/domain/currencyUtils';
import { CustomSelect, type SelectOption } from '../../shared/presentation/CustomSelect';

export const TransactionsView: React.FC = () => {
  const { transactions, createTransaction, deleteTransaction } =
    useTransactionsStore();
  const { vaults } = useVaultsStore();
  const { rates } = useRatesStore();
  const { categories } = useCategoriesStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [vaultId, setVaultId] = useState('');
  const [destinationVaultId, setDestinationVaultId] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAmount, setDestinationAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
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
        categoryId: categoryId || undefined,
        type,
        note,
      });
    }

    setAmount('');
    setDestinationAmount('');
    setNote('');
    setCategoryId('');
  };

  const handleAutoCalculateDest = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !sourceVault || !destVault || !rates) return;

    const calculatedDestAmount = convertCurrency(
      numAmount,
      sourceVault.currency,
      destVault.currency,
      rates
    );

    setDestinationAmount(calculatedDestAmount.toFixed(2));
  };

  const filteredTxs = filterVaultId
    ? transactions.filter(
        (tx) =>
          tx.vaultId === filterVaultId ||
          tx.destinationVaultId === filterVaultId
      )
    : transactions;

  const filterOptions: SelectOption[] = [
    { value: '', label: 'Todas las bóvedas' },
    ...vaults.map((v) => ({
      value: v.id,
      label: v.name,
      sublabel: v.currency,
    })),
  ];

  return (
    <div className="space-y-6">
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
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        note={note}
        setNote={setNote}
        vaults={vaults}
        categories={categories}
        rates={rates}
        onSubmit={(e) => void handleSubmit(e)}
        onAutoCalculateDest={handleAutoCalculateDest}
      />

      {/* Historial de Movimientos */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xs font-title-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            Historial Reciente
          </h2>
          <div className="w-full sm:w-60">
            <CustomSelect
              options={filterOptions}
              value={filterVaultId}
              onChange={(val) => setFilterVaultId(val)}
              placeholder="Todas las bóvedas"
            />
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-6 text-center font-mono">
            No hay movimientos registrados para el filtro seleccionado.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto pr-1">
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
