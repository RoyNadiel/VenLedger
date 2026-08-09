import React, { useState } from 'react';
import { useVaultsStore } from './useVaultsStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
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

export const VaultsSummary: React.FC = () => {
  const { vaults, createVault, updateVault, deleteVault } = useVaultsStore();
  const { transactions, createTransaction } = useTransactionsStore();
  const { rates } = useRatesStore();

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
    if (window.confirm('¿Seguro que deseas eliminar esta bóveda?')) {
      await deleteVault(id);
    }
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* 1. Bs → USD (compra USD) */}
        <ConversionCard
          title="Bs → USD"
          amount={
            rates?.usd_official ? consolidated.totalVES / rates.usd_official : 0
          }
          currencySymbol="$"
          locale="en-US"
          cardStyleClass="pastel-blue-card"
          titleColorClass="text-sky-800"
          amountColorClass="text-sky-950"
          subColorClass="text-sky-700"
          rateLabel={`Tasa BCV: ${rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD`}
        />

        {/* 2. USD → Bs (venta USD) */}
        <ConversionCard
          title="USD → Bs"
          amount={consolidated.totalVES}
          currencySymbol="Bs."
          locale="es-VE"
          cardStyleClass="pastel-green-card"
          titleColorClass="text-emerald-800"
          amountColorClass="text-emerald-950"
          subColorClass="text-emerald-700"
          rateLabel={`Tasa BCV: ${rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD`}
        />

        {/* 3. Bs → EUR */}
        <ConversionCard
          title="Bs → EUR"
          amount={
            rates?.eur_official ? consolidated.totalVES / rates.eur_official : 0
          }
          currencySymbol="€"
          locale="de-DE"
          cardStyleClass="pastel-pink-card"
          titleColorClass="text-pink-800"
          amountColorClass="text-pink-950"
          subColorClass="text-pink-700"
          rateLabel={`Tasa BCV Euro: ${rates ? rates.eur_official.toFixed(2) : '...'} Bs/EUR`}
        />

        {/* 4. EUR → Bs */}
        <ConversionCard
          title="EUR → Bs"
          amount={consolidated.totalVES}
          currencySymbol="Bs."
          locale="es-VE"
          cardStyleClass="pastel-purple-card"
          titleColorClass="text-purple-800"
          amountColorClass="text-purple-950"
          subColorClass="text-purple-700"
          rateLabel={`Tasa BCV Euro: ${rates ? rates.eur_official.toFixed(2) : '...'} Bs/EUR`}
        />

        {/* 5. Bs → USDT */}
        <ConversionCard
          title="Bs → USDT"
          amount={
            rates?.usd_libre ? consolidated.totalVES / rates.usd_libre : 0
          }
          currencySymbol="$"
          locale="en-US"
          cardStyleClass="pastel-yellow-card"
          titleColorClass="text-amber-800"
          amountColorClass="text-amber-950"
          subColorClass="text-amber-700"
          rateLabel={`Tasa Binance: ${rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT`}
        />

        {/* 6. USDT → Bs */}
        <ConversionCard
          title="USDT → Bs"
          amount={consolidated.totalVES}
          currencySymbol="Bs."
          locale="es-VE"
          cardStyleClass="pastel-green-card"
          titleColorClass="text-emerald-800"
          amountColorClass="text-emerald-950"
          subColorClass="text-emerald-700"
          rateLabel={`Tasa Binance: ${rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT`}
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
