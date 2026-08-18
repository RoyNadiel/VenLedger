import React, { useEffect, useState } from 'react';
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
import { VaultDetailView } from './VaultDetailView';

interface VaultsSummaryProps {
  hideSummaryOnMobile?: boolean;
}

export const VaultsSummary: React.FC<VaultsSummaryProps> = ({
  hideSummaryOnMobile = false,
}) => {
  const { vaults, createVault, updateVault, deleteVault } = useVaultsStore();
  const { transactions, createTransaction } = useTransactionsStore();
  const { rates } = useRatesStore();
  const [vesImpact, setVesImpact] = useState<VesImpactPeriods | null>(null);

  const [selectedVaultForDetails, setSelectedVaultForDetails] =
    useState<Vault | null>(null);
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

  if (selectedVaultForDetails) {
    return (
      <VaultDetailView
        vault={selectedVaultForDetails}
        rates={rates}
        transactions={transactions}
        vaults={vaults}
        onBack={() => setSelectedVaultForDetails(null)}
        onEdit={(v) => {
          setSelectedVaultForDetails(null);
          handleStartEdit(v);
        }}
        onDelete={(id) => void handleDelete(id)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarjetas de Conversión Consolidada */}
      <div
        className={`${
          hideSummaryOnMobile ? 'hidden md:grid' : 'grid'
        } grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-3`}
      >
        {/* 1. Bs → USD (compra USD) */}
        <ConversionCard
          title="Bs → USD"
          amount={
            rates?.usd_official ? consolidated.totalVES / rates.usd_official : 0
          }
          currencySymbol="$"
          locale="en-US"
          cardStyleClass="pastel-blue-card"
          titleColorClass="text-sky-800 dark:text-sky-400"
          amountColorClass="text-sky-950 dark:text-sky-300"
          subColorClass="text-sky-700 dark:text-sky-600"
          rateLabel={`Tasa BCV: ${rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD`}
        />

        {/* 2. Bs → EUR */}
        <ConversionCard
          title="Bs → EUR"
          amount={
            rates?.eur_official ? consolidated.totalVES / rates.eur_official : 0
          }
          currencySymbol="€"
          locale="de-DE"
          cardStyleClass="pastel-pink-card"
          titleColorClass="text-pink-800 dark:text-pink-400"
          amountColorClass="text-pink-950 dark:text-pink-300"
          subColorClass="text-pink-700 dark:text-pink-600"
          rateLabel={`Tasa BCV Euro: ${rates ? rates.eur_official.toFixed(2) : '...'} Bs/EUR`}
        />

        {/* 3. Bs → USDT */}
        <ConversionCard
          title="Bs → USDT"
          amount={
            rates?.usd_libre ? consolidated.totalVES / rates.usd_libre : 0
          }
          currencySymbol="$"
          locale="en-US"
          cardStyleClass="pastel-yellow-card"
          titleColorClass="text-amber-800 dark:text-amber-400"
          amountColorClass="text-amber-950 dark:text-amber-300"
          subColorClass="text-amber-700 dark:text-amber-600"
          rateLabel={`Tasa Binance: ${rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT`}
        />

        {/* 4. USD → Bs (venta USD) */}
        <ConversionCard
          title="Bolivars Totales"
          amount={consolidated.totalVES}
          currencySymbol="Bs."
          locale="es-VE"
          cardStyleClass="pastel-green-card"
          titleColorClass="text-emerald-800 dark:text-emerald-400"
          amountColorClass="text-emerald-950 dark:text-emerald-300"
          subColorClass="text-emerald-700 dark:text-emerald-600"
          rateLabel={`Tasa BCV: ${rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD`}
          vesImpact={vesImpact}
        />
      </div>

      {/* Encabezado de Bóvedas y Botón Crear */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-700">
          Tus Bóvedas de Fondos
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
        >
          {isCreating ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
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
            onOpenDetails={setSelectedVaultForDetails}
          />
        ))}
      </div>
    </div>
  );
};
