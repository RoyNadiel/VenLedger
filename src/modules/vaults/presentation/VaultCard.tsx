import React from 'react';
import type { Vault } from '../domain/entities';
import type { Currency, VaultType, ExchangeRates } from '../../shared/domain/types';
import type { Transaction } from '../../transactions/domain/entities';
import { History, Pencil } from 'lucide-react';
import { VaultHistoryList } from './VaultHistoryList';

export interface VaultCardProps {
  vault: Vault;
  rates: ExchangeRates | null;
  transactions: Transaction[];
  vaults: Vault[];
  editingVault: Vault | null;
  setEditingVault: (vault: Vault | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editType: VaultType;
  setEditType: (type: VaultType) => void;
  editCurrency: Currency;
  setEditCurrency: (curr: Currency) => void;
  handleStartEdit: (vault: Vault) => void;
  handleSaveEdit: () => void;
  handleDelete: (id: string) => void;
  isHistoryActive: boolean;
  setActiveVaultHistoryId: (id: string | null) => void;
  onOpenDetails?: (vault: Vault) => void;
}

export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  rates,
  transactions,
  vaults,
  editingVault,
  setEditingVault,
  editName,
  setEditName,
  editType,
  setEditType,
  editCurrency,
  setEditCurrency,
  handleStartEdit,
  handleSaveEdit,
  handleDelete,
  isHistoryActive,
  setActiveVaultHistoryId,
  onOpenDetails,
}) => {
  const isEditing = editingVault?.id === vault.id;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
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
                onChange={(e) => setEditType(e.target.value as VaultType)}
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
                onChange={(e) => setEditCurrency(e.target.value as Currency)}
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
              onClick={() => handleDelete(vault.id)}
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
                onClick={handleSaveEdit}
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
              <div>
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
                {/* Equivalente en $ para Bóvedas en Bolívares (Tasa BCV) */}
                {vault.currency === 'VES' && rates && rates.usd_official > 0 && (
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    ≈ ${' '}
                    {(vault.balance / rates.usd_official).toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Tasa BCV)
                    </span>
                  </div>
                )}
                {/* Equivalente en Bs para Bóvedas en Divisas */}
                {vault.currency !== 'VES' && rates && (
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    ≈ Bs.{' '}
                    {(
                      vault.balance *
                      (vault.currency === 'USDT'
                        ? rates.usd_libre
                        : vault.currency === 'EUR'
                          ? rates.eur_official
                          : rates.usd_official)
                    ).toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({vault.currency === 'USDT' ? 'Binance' : 'BCV'})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onOpenDetails) {
                      onOpenDetails(vault);
                    } else {
                      setActiveVaultHistoryId(
                        isHistoryActive ? null : vault.id
                      );
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 flex items-center space-x-1 cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Ver Detalle</span>
                </button>
                <button
                  onClick={() => handleStartEdit(vault)}
                  className="text-xs text-sky-600 hover:underline cursor-pointer font-medium flex items-center space-x-0.5"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
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
              <VaultHistoryList
                vault={vault}
                transactions={transactions}
                vaults={vaults}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
