import { create } from 'zustand';
import type { Transaction } from '../domain/entities';
import { dexieTransactionRepository } from '../infrastructure/dexieTransactionRepository';
import { dexieVaultRepository } from '../../vaults/infrastructure/dexieVaultRepository';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  loadTransactions: () => Promise<void>;
  createTransaction: (
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoading: false,
  loadTransactions: async () => {
    set({ isLoading: true });
    const txs = await dexieTransactionRepository.getAll();
    set({ transactions: txs, isLoading: false });
  },
  createTransaction: async (data) => {
    // 1. Guardar la transacción
    const tx = await dexieTransactionRepository.create(data);

    // 2. Ajustar el saldo de la(s) bóveda(s) correspondiente(s)
    const isTransfer = data.type === 'transfer' || data.type === 'buy_sell';

    if (isTransfer && data.destinationVaultId) {
      // Bóveda de Origen se descuenta
      const sourceVault = await dexieVaultRepository.getById(data.vaultId);
      if (sourceVault) {
        await dexieVaultRepository.update(data.vaultId, {
          balance: sourceVault.balance - data.amount,
        });
      }

      // Bóveda de Destino se incrementa
      const destVault = await dexieVaultRepository.getById(data.destinationVaultId);
      if (destVault) {
        const addedAmount = data.destinationAmount ?? data.amount;
        await dexieVaultRepository.update(data.destinationVaultId, {
          balance: destVault.balance + addedAmount,
        });
      }
    } else {
      const vault = await dexieVaultRepository.getById(data.vaultId);
      if (vault) {
        let balanceAdjustment = 0;
        if (data.type === 'income') balanceAdjustment = data.amount;
        else if (data.type === 'expense') balanceAdjustment = -data.amount;

        if (balanceAdjustment !== 0) {
          await dexieVaultRepository.update(data.vaultId, {
            balance: vault.balance + balanceAdjustment,
          });
        }
      }
    }

    // 3. Recargar estado en la UI
    await get().loadTransactions();
    await useVaultsStore.getState().loadVaults();
    await useOutboxStore.getState().refreshOutboxState();

    return tx;
  },
  deleteTransaction: async (id) => {
    // 1. Buscar la transacción antes de eliminarla para revertir el saldo de la bóveda
    const txs = get().transactions;
    const txToDelete = txs.find((t) => t.id === id);

    if (txToDelete) {
      const isTransfer = txToDelete.type === 'transfer' || txToDelete.type === 'buy_sell';
      if (isTransfer && txToDelete.destinationVaultId) {
        // Revertir origen
        const sourceVault = await dexieVaultRepository.getById(txToDelete.vaultId);
        if (sourceVault) {
          await dexieVaultRepository.update(txToDelete.vaultId, {
            balance: sourceVault.balance + txToDelete.amount,
          });
        }
        // Revertir destino
        const destVault = await dexieVaultRepository.getById(txToDelete.destinationVaultId);
        if (destVault) {
          const removedAmount = txToDelete.destinationAmount ?? txToDelete.amount;
          await dexieVaultRepository.update(txToDelete.destinationVaultId, {
            balance: Math.max(0, destVault.balance - removedAmount),
          });
        }
      } else {
        const vault = await dexieVaultRepository.getById(txToDelete.vaultId);
        if (vault) {
          let revertAdjustment = 0;
          if (txToDelete.type === 'income') revertAdjustment = -txToDelete.amount;
          else if (txToDelete.type === 'expense') revertAdjustment = txToDelete.amount;

          if (revertAdjustment !== 0) {
            await dexieVaultRepository.update(txToDelete.vaultId, {
              balance: Math.max(0, vault.balance + revertAdjustment),
            });
          }
        }
      }
    }

    // 2. Eliminar la transacción
    await dexieTransactionRepository.delete(id);

    // 3. Recargar los estados
    await get().loadTransactions();
    await useVaultsStore.getState().loadVaults();
    await useOutboxStore.getState().refreshOutboxState();
  },
}));
