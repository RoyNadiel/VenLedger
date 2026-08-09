import React, { useState, useMemo } from 'react';
import type { Vault } from '../domain/entities';
import type { ExchangeRates } from '../../shared/domain/types';
import type { Transaction } from '../../transactions/domain/entities';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Wallet,
  Building2,
  Coins,
} from 'lucide-react';

interface VaultDetailModalProps {
  vault: Vault;
  rates: ExchangeRates | null;
  transactions: Transaction[];
  vaults: Vault[];
  onClose: () => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vaultId: string) => void;
}

export const VaultDetailModal: React.FC<VaultDetailModalProps> = ({
  vault,
  rates,
  transactions,
  vaults,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'income' | 'expense' | 'transfer'
  >('all');

  // Filtrar transacciones pertenecientes únicamente a esta bóveda
  const vaultTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.vaultId === vault.id || t.destinationVaultId === vault.id
    );
  }, [transactions, vault.id]);

  // Cálculos estadísticos para la bóveda
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    vaultTransactions.forEach((t) => {
      if (t.vaultId === vault.id) {
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expense') totalExpense += t.amount;
        if (t.type === 'transfer') totalExpense += t.amount; // Salida de esta bóveda
      } else if (t.destinationVaultId === vault.id && t.type === 'transfer') {
        totalIncome += t.amount; // Entrada por transferencia
      }
    });

    return {
      totalIncome,
      totalExpense,
      netFlow: totalIncome - totalExpense,
      totalCount: vaultTransactions.length,
    };
  }, [vaultTransactions, vault.id]);

  // Filtrado por búsqueda y tipo
  const filteredTransactions = useMemo(() => {
    return vaultTransactions.filter((t) => {
      const matchesSearch =
        t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase());

      const isIncome =
        t.type === 'income' ||
        (t.destinationVaultId === vault.id && t.type === 'transfer');
      const isExpense = t.type === 'expense';
      const isTransfer = t.type === 'transfer';

      if (filterType === 'income' && !isIncome) return false;
      if (filterType === 'expense' && !isExpense) return false;
      if (filterType === 'transfer' && !isTransfer) return false;

      return matchesSearch;
    });
  }, [vaultTransactions, searchTerm, filterType, vault.id]);

  // Calcular equivalencias
  const equivalentInVES = useMemo(() => {
    if (!rates) return null;
    if (vault.currency === 'VES') return vault.balance;
    if (vault.currency === 'USDT') return vault.balance * rates.usd_libre;
    if (vault.currency === 'EUR') return vault.balance * rates.eur_official;
    return vault.balance * rates.usd_official;
  }, [vault, rates]);

  const equivalentInUSD = useMemo(() => {
    if (!rates || rates.usd_official <= 0) return null;
    if (vault.currency === 'USD') return vault.balance;
    if (!equivalentInVES) return null;
    return equivalentInVES / rates.usd_official;
  }, [vault, rates, equivalentInVES]);

  const currencySymbol =
    vault.currency === 'VES' ? 'Bs.' : vault.currency === 'EUR' ? '€' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Encabezado Principal */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-100/80 text-sky-700 shrink-0">
              {vault.type === 'binance' ? (
                <Coins className="w-5 h-5" />
              ) : vault.type === 'bank' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {vault.type === 'binance'
                    ? 'Binance'
                    : vault.type === 'cash'
                      ? 'Efectivo'
                      : 'Banco Local'}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {vault.currency}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {vault.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(vault)}
              className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              title="Editar Bóveda"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm('¿Seguro que deseas eliminar esta bóveda?')
                ) {
                  onDelete(vault.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Eliminar Bóveda"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Tarjeta de Saldo y Equivalentes */}
          <div className="bg-linear-to-br from-sky-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="text-xs font-medium text-sky-200 uppercase tracking-wider">
              Saldo Actual de Bóveda
            </div>
            <div className="text-3xl font-black">
              {currencySymbol}{' '}
              {vault.balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="pt-2 border-t border-sky-800/80 flex flex-wrap gap-4 text-xs">
              {vault.currency !== 'VES' && equivalentInVES !== null && (
                <div>
                  <span className="text-sky-300">Equivalente en Bs: </span>
                  <span className="font-bold text-white">
                    Bs.{' '}
                    {equivalentInVES.toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {vault.currency === 'VES' && equivalentInUSD !== null && (
                <div>
                  <span className="text-sky-300">Equivalente en USD: </span>
                  <span className="font-bold text-white">
                    ${' '}
                    {equivalentInUSD.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas de Resumen Específico */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
              <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Ingresos Totales</span>
              </div>
              <div className="text-sm font-extrabold text-emerald-950">
                {currencySymbol} {stats.totalIncome.toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
              <div className="flex items-center space-x-1 text-rose-700 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Egresos Totales</span>
              </div>
              <div className="text-sm font-extrabold text-rose-950">
                {currencySymbol} {stats.totalExpense.toFixed(2)}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Movimientos</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {stats.totalCount} registros
              </div>
            </div>
          </div>

          {/* Sección de Historial de Movimientos */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                Historial de Movimientos
              </h3>

              {/* Filtros de Tipo */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'income', 'expense', 'transfer'] as const).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        filterType === type
                          ? 'bg-white text-sky-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {type === 'all'
                        ? 'Todos'
                        : type === 'income'
                          ? 'Ingresos'
                          : type === 'expense'
                            ? 'Egresos'
                            : 'Transf.'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nota o concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden bg-slate-50/50 focus:bg-white"
              />
            </div>

            {/* Lista de Movimientos */}
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                No hay movimientos registrados en esta bóveda.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => {
                  const isIncome =
                    tx.type === 'income' ||
                    (tx.destinationVaultId === vault.id &&
                      tx.type === 'transfer');
                  const isTransfer = tx.type === 'transfer';
                  const otherVaultId =
                    tx.vaultId === vault.id
                      ? tx.destinationVaultId
                      : tx.vaultId;
                  const otherVault = vaults.find((v) => v.id === otherVaultId);

                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 hover:border-sky-200 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isTransfer
                              ? 'bg-purple-100 text-purple-700'
                              : isIncome
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isTransfer ? (
                            <ArrowLeftRight className="w-4 h-4" />
                          ) : isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {tx.note ||
                              (isTransfer
                                ? tx.vaultId === vault.id
                                  ? `Transferencia a ${otherVault?.name || 'Bóveda'}`
                                  : `Transferencia desde ${otherVault?.name || 'Bóveda'}`
                                : isIncome
                                  ? 'Ingreso'
                                  : 'Egreso')}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(tx.createdAt).toLocaleDateString()}{' '}
                                {new Date(tx.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </span>
                            {isTransfer && otherVault && (
                              <span className="font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                                {tx.vaultId === vault.id
                                  ? `→ ${otherVault.name}`
                                  : `← ${otherVault.name}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-extrabold shrink-0 ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {currencySymbol}{' '}
                        {tx.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
