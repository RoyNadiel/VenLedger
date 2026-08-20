import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVaultsStore } from './useVaultsStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { VaultDetailView } from './VaultDetailView';

export const VaultDetailRoute: React.FC = () => {
  const { vaultId } = useParams<{ vaultId: string }>();
  const navigate = useNavigate();
  const { vaults, deleteVault } = useVaultsStore();
  const { transactions } = useTransactionsStore();
  const { rates } = useRatesStore();

  const vault = vaults.find((v) => v.id === vaultId);

  if (!vault) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-xs text-zinc-500 font-mono">Bóveda no encontrada.</p>
        <button
          onClick={() => navigate('/vaults')}
          className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-title-bold rounded-md cursor-pointer"
        >
          Volver a Bóvedas
        </button>
      </div>
    );
  }

  return (
    <VaultDetailView
      vault={vault}
      rates={rates}
      transactions={transactions}
      vaults={vaults}
      onBack={() => navigate('/vaults')}
      onEdit={() => {
        navigate('/vaults');
      }}
      onDelete={(id) => {
        void deleteVault(id);
        navigate('/vaults');
      }}
    />
  );
};
