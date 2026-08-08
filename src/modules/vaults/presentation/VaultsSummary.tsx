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

export const VaultsSummary: React.FC = () => {
  const { vaults, createVault, updateVault, deleteVault } = useVaultsStore();
  const { transactions, createTransaction } = useTransactionsStore();
  const { rates } = useRatesStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VaultType>('cash');
  const [newCurrency, setNewCurrency] = useState<Currency>('USD');
  const [newBalance, setNewBalance] = useState('');

  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<VaultType>('cash');
  const [editCurrency, setEditCurrency] = useState<Currency>('USD');
  const [activeVaultHistoryId, setActiveVaultHistoryId] = useState<
    string | null
  >(null);

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

  return (
    <div className="space-y-4">
      {/* Tarjetas de Conversión Consolidada */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* 1. Bs → USD (compra USD) */}
        <div className="pastel-green-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Bs → USD (compra USD)
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
            ${' '}
            {(rates?.usd_official
              ? consolidated.totalVES / rates.usd_official
              : 0
            ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-700 mt-1">
            Tasa BCV: {rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD
          </div>
        </div>

        {/* 3. Bs → EUR */}
        <div className="pastel-yellow-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Bs → EUR
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
            €{' '}
            {(rates?.eur_official
              ? consolidated.totalVES / rates.eur_official
              : 0
            ).toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-amber-700 mt-1">
            Tasa BCV Euro: {rates ? rates.eur_official.toFixed(2) : '...'}{' '}
            Bs/EUR
          </div>
        </div>

        {/* 5. Bs → USDT */}
        <div className="pastel-blue-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
            Bs → USDT
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 mt-1">
            ${' '}
            {(rates?.usd_libre
              ? consolidated.totalVES / rates.usd_libre
              : 0
            ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-sky-700 mt-1">
            Tasa Binance: {rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT
          </div>
        </div>

        {/* 2. USD → Bs (venta USD) */}
        <div className="pastel-green-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            USD → Bs (venta USD)
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
            Bs.{' '}
            {consolidated.totalVES.toLocaleString('es-VE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-700 mt-1">
            Tasa BCV: {rates ? rates.usd_official.toFixed(2) : '...'} Bs/USD
          </div>
        </div>

        {/* 4. EUR → Bs */}
        <div className="pastel-yellow-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            EUR → Bs
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
            Bs.{' '}
            {consolidated.totalVES.toLocaleString('es-VE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-amber-700 mt-1">
            Tasa BCV Euro: {rates ? rates.eur_official.toFixed(2) : '...'}{' '}
            Bs/EUR
          </div>
        </div>

        {/* 6. USDT → Bs */}
        <div className="pastel-blue-card p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
            USDT → Bs
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950 mt-1">
            Bs.{' '}
            {consolidated.totalVES.toLocaleString('es-VE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] sm:text-xs text-sky-700 mt-1">
            Tasa Binance: {rates ? rates.usd_libre.toFixed(2) : '...'} Bs/USDT
          </div>
        </div>
      </div>

      {/* Encabezado de Bóvedas y Botón Crear */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-700">
          Tus Bóvedas de Fondos
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {isCreating ? 'Cancelar' : '+ Nueva Bóveda'}
        </button>
      </div>

      {/* Formulario de Nueva Bóveda */}
      {isCreating && (
        <form
          onSubmit={(e) => void handleCreateSubmit(e)}
          className="bg-white border border-sky-200 rounded-2xl p-4 shadow-xs space-y-3"
        >
          <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            Crear Nueva Bóveda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Ej. Zinli, Zelle, Banesco"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tipo
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as VaultType)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
              >
                <option value="bank">Banco Local / Digital</option>
                <option value="cash">Efectivo</option>
                <option value="binance">Binance / Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Moneda Base
              </label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value as Currency)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
              >
                <option value="USD">USD ($)</option>
                <option value="USDT">USDT (Cryptocurr.)</option>
                <option value="VES">VES (Bs.)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Saldo Inicial
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Guardar Bóveda
            </button>
          </div>
        </form>
      )}

      {/* Desglose por Bóveda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        {vaults.map((vault) => {
          const isEditing = editingVault?.id === vault.id;
          const isHistoryActive = activeVaultHistoryId === vault.id;

          return (
            <div
              key={vault.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              {isEditing ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-sky-400 rounded-lg px-2 py-1 outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-500 mb-0.5">
                        Tipo
                      </label>
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(e.target.value as VaultType)
                        }
                        className="w-full border border-sky-400 rounded-lg px-2 py-1 bg-white outline-hidden"
                      >
                        <option value="bank">Banco</option>
                        <option value="cash">Efectivo</option>
                        <option value="binance">Binance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-500 mb-0.5">
                        Moneda
                      </label>
                      <select
                        value={editCurrency}
                        onChange={(e) =>
                          setEditCurrency(e.target.value as Currency)
                        }
                        className="w-full border border-sky-400 rounded-lg px-2 py-1 bg-white outline-hidden"
                      >
                        <option value="USD">USD</option>
                        <option value="USDT">USDT</option>
                        <option value="VES">VES</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => void handleDelete(vault.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Eliminar
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingVault(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => void handleSaveEdit()}
                        className="px-3 py-1 bg-sky-600 text-white rounded-lg font-bold cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {vault.type === 'binance'
                        ? 'Binance'
                        : vault.type === 'cash'
                          ? 'Efectivo'
                          : 'Banco Local'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                      {vault.currency}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {vault.name}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-bold text-slate-900">
                        {vault.currency === 'VES'
                          ? 'Bs.'
                          : vault.currency === 'EUR'
                            ? '€'
                            : '$'}{' '}
                        {vault.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setActiveVaultHistoryId(
                              isHistoryActive ? null : vault.id
                            )
                          }
                          className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            isHistoryActive
                              ? 'bg-sky-100 text-sky-700'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          📋 Movimientos
                        </button>
                        <button
                          onClick={() => handleStartEdit(vault)}
                          className="text-xs text-sky-600 hover:underline cursor-pointer font-medium"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Historial Específico de esta Bóveda */}
                  {isHistoryActive && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Historial de {vault.name}
                      </div>
                      {(() => {
                        const vaultTxs = transactions.filter(
                          (t) =>
                            t.vaultId === vault.id ||
                            t.destinationVaultId === vault.id
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
                              const isIncomingTransfer =
                                tx.destinationVaultId === vault.id;
                              const isOutgoingTransfer =
                                tx.vaultId === vault.id &&
                                (tx.type === 'transfer' ||
                                  tx.type === 'buy_sell');
                              const source = vaults.find(
                                (v) => v.id === tx.vaultId
                              );
                              const dest = vaults.find(
                                (v) => v.id === tx.destinationVaultId
                              );

                              let detailText = tx.note || '';
                              if (!detailText) {
                                if (isIncomingTransfer)
                                  detailText = `Recibido de ${source?.name || 'Bóveda'}`;
                                else if (isOutgoingTransfer)
                                  detailText = `Enviado a ${dest?.name || 'Bóveda'}`;
                                else if (tx.type === 'income')
                                  detailText = 'Ingreso';
                                else detailText = 'Gasto';
                              }

                              let amountDisplay = '';
                              let amountColor = 'text-slate-800';

                              if (isIncomingTransfer) {
                                const receivedAmt =
                                  tx.destinationAmount ?? tx.amount;
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
                                      {isIncomingTransfer &&
                                        `De: ${source?.name} • `}
                                      {isOutgoingTransfer &&
                                        `A: ${dest?.name} • `}
                                      {new Date(
                                        tx.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className={`shrink-0 ${amountColor}`}>
                                    {amountDisplay}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
