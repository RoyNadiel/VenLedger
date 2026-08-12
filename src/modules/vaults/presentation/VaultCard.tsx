import React, { useState } from 'react';
import type { Vault } from '../domain/entities';
import type {
  Currency,
  VaultType,
  ExchangeRates,
} from '../../shared/domain/types';
import { Pencil } from 'lucide-react';
import { ConfirmModal } from '../../shared/presentation/ConfirmModal';
import { getCurrencySymbol, getRateInVES } from '../../shared/domain/currencyUtils';

export interface VaultCardProps {
  vault: Vault;
  rates: ExchangeRates | null;
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
  onOpenDetails?: (vault: Vault) => void;
}

export const VaultCard: React.FC<VaultCardProps> = ({
  vault,
  rates,
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
  onOpenDetails,
}) => {
  const isEditing = editingVault?.id === vault.id;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div
      onClick={() => {
        if (!isEditing && onOpenDetails) {
          onOpenDetails(vault);
        }
      }}
      className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
        !isEditing ? 'hover:border-sky-300 hover:shadow-md cursor-pointer' : ''
      }`}
    >
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="¿Eliminar esta bóveda?"
        message={`¿Estás seguro de que deseas eliminar la bóveda "${vault.name}"? Los movimientos asociados seguirán registrados.`}
        confirmText="Eliminar Bóveda"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => handleDelete(vault.id)}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()} className="space-y-2 text-xs">
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
              onClick={() => setIsDeleteModalOpen(true)}
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
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                {vault.currency}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(vault);
                }}
                className="text-xs text-slate-400 hover:text-sky-600 p-1 transition-colors cursor-pointer rounded-lg hover:bg-sky-50"
                title="Editar Bóveda"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
              {vault.name}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-xl font-black text-slate-900">
                  {getCurrencySymbol(vault.currency)}{' '}
                  {vault.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {/* Equivalente en $ para Bóvedas en Bolívares (Tasa BCV) */}
                {vault.currency === 'VES' &&
                  rates &&
                  rates.usd_official > 0 && (
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
                      vault.balance * getRateInVES(vault.currency, rates)
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};
