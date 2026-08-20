import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaultsStore } from './useVaultsStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { ratesService } from '../../rates/application/ratesService';
import type { VesImpactPeriods } from '../../rates/domain/vesImpactEngine';
import {
  FinanceEngine,
  type ConsolidatedBalance,
} from '../../analytics/domain/financeEngine';
import type { Currency, VaultType } from '../../shared/domain/types';
import type { Vault } from '../domain/entities';
import { Plus, X } from 'lucide-react';
import { ConversionCard } from './ConversionCard';
import { CreateVaultForm } from './CreateVaultForm';
import { VaultCard } from './VaultCard';

interface VaultsSummaryProps {
  hideSummaryOnMobile?: boolean;
}

export const VaultsSummary: React.FC<VaultsSummaryProps> = ({
  hideSummaryOnMobile = false,
}) => {
  const navigate = useNavigate();
  const { vaults, createVault, updateVault, deleteVault } = useVaultsStore();
  const { createTransaction } = useTransactionsStore();
  const { rates } = useRatesStore();
  const [vesImpact, setVesImpact] = useState<VesImpactPeriods | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VaultType>('cash');
  const [newCurrency, setNewCurrency] = useState<Currency>('USD');
  const [newBalance, setNewBalance] = useState('');

  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<VaultType>('cash');
  const [editCurrency, setEditCurrency] = useState<Currency>('USD');

  const consolidated: ConsolidatedBalance = rates
    ? FinanceEngine.calculateConsolidatedBalance(vaults, rates)
    : {
        totalVES: 0,
        totalUSD: 0,
        totalUSDT: 0,
        totalEUR: 0,
        totalVES_Official: 0,
        totalVES_Libre: 0,
        vaultBreakdown: [],
      };

  useEffect(() => {
    async function loadConsolidatedImpact() {
      const vesVaultsBalance = vaults
        .filter((v) => v.currency === 'VES')
        .reduce((acc, v) => acc + v.balance, 0);

      if (vesVaultsBalance > 0 && rates?.usd_official) {
        const impact = await ratesService.getVesImpact(
          vesVaultsBalance,
          rates.usd_official
        );
        setVesImpact(impact);
      } else {
        setVesImpact(null);
      }
    }
    void loadConsolidatedImpact();
  }, [vaults, rates?.usd_official]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const initialAmount = parseFloat(newBalance) || 0;
    if (!newName.trim()) return;

    const vault = await createVault({
      name: newName.trim(),
      type: newType,
      currency: newCurrency,
      balance: 0,
    });

    if (initialAmount > 0) {
      await createTransaction({
        vaultId: vault.id,
        amount: initialAmount,
        currency: newCurrency,
        type: 'income',
        note: 'Saldo inicial',
      });
    }

    setNewName('');
    setNewBalance('');
    setIsCreating(false);
  };

  const handleStartEdit = (vault: Vault) => {
    setEditingVault(vault);
    setEditName(vault.name);
    setEditType(vault.type);
    setEditCurrency(vault.currency);
  };

  const handleSaveEdit = async () => {
    if (!editingVault || !editName.trim()) return;

    await updateVault(editingVault.id, {
      name: editName.trim(),
      type: editType,
      currency: editCurrency,
    });

    setEditingVault(null);
  };

  const handleDelete = async (id: string) => {
    await deleteVault(id);
  };

  return (
    <div className="space-y-4">
      {/* Franja Unificada de Conversión Consolidada */}
      <div
        className={`${
          hideSummaryOnMobile ? 'hidden md:grid' : 'grid'
        } grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800`}
      >
        <ConversionCard
          title="Bs → USD"
          amount={
            rates?.usd_official ? consolidated.totalVES / rates.usd_official : 0
          }
          currencySymbol="$"
          locale="en-US"
          rateLabel={`BCV: ${rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD`}
        />

        <ConversionCard
          title="Bs → EUR"
          amount={
            rates?.eur_official ? consolidated.totalVES / rates.eur_official : 0
          }
          currencySymbol="€"
          locale="de-DE"
          rateLabel={`BCV: ${rates ? rates.eur_official.toFixed(2) : '...'} Bs/EUR`}
        />

        <ConversionCard
          title="Bs → USDT"
          amount={
            rates?.usd_libre ? consolidated.totalVES / rates.usd_libre : 0
          }
          currencySymbol="$"
          locale="en-US"
          rateLabel={`Binance P2P: ${rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT`}
        />

        <ConversionCard
          title="Bolívares Totales"
          amount={consolidated.totalVES}
          currencySymbol="Bs."
          locale="es-VE"
          rateLabel={`Oficial BCV`}
          vesImpact={vesImpact}
        />
      </div>

      {/* Encabezado de Bóvedas y Botón Crear */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xs font-title-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase font-mono">
          Bóvedas de Fondos
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-title-semibold text-xs rounded-md transition-colors cursor-pointer flex items-center space-x-1.5"
        >
          {isCreating ? (
            <>
              <X className="w-3 h-3" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>Nueva Bóveda</span>
            </>
          )}
        </button>
      </div>

      {/* Formulario de Nueva Bóveda */}
      {isCreating && (
        <CreateVaultForm
          newName={newName}
          setNewName={setNewName}
          newType={newType}
          setNewType={setNewType}
          newCurrency={newCurrency}
          setNewCurrency={setNewCurrency}
          newBalance={newBalance}
          setNewBalance={setNewBalance}
          onSubmit={(e) => void handleCreateSubmit(e)}
        />
      )}

      {/* Desglose por Bóveda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        {vaults.map((vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            rates={rates}
            editingVault={editingVault}
            setEditingVault={setEditingVault}
            editName={editName}
            setEditName={setEditName}
            editType={editType}
            setEditType={setEditType}
            editCurrency={editCurrency}
            setEditCurrency={setEditCurrency}
            handleStartEdit={handleStartEdit}
            handleSaveEdit={() => void handleSaveEdit()}
            handleDelete={(id) => void handleDelete(id)}
            onOpenDetails={(v) => navigate(`/vaults/${v.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
