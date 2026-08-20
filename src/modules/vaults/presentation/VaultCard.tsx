import React, { useEffect, useState } from 'react';
import type { Vault } from '../domain/entities';
import type {
  Currency,
  VaultType,
  ExchangeRates,
} from '../../shared/domain/types';
import { Pencil, TrendingDown, TrendingUp, Minus, Landmark, Wallet, Coins } from 'lucide-react';
import { ConfirmModal } from '../../shared/presentation/ConfirmModal';
import {
  getCurrencySymbol,
  getRateInVES,
} from '../../shared/domain/currencyUtils';
import { ratesService } from '../../rates/application/ratesService';
import type { VesImpactPeriods } from '../../rates/domain/vesImpactEngine';
import { CustomSelect, type SelectOption } from '../../shared/presentation/CustomSelect';

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
  const [vesImpact, setVesImpact] = useState<VesImpactPeriods | null>(null);
  const [period, setPeriod] = useState<'day1' | 'days7' | 'days30'>('day1');

  useEffect(() => {
    async function loadImpact() {
      if (
        vault.currency === 'VES' &&
        vault.balance > 0 &&
        rates?.usd_official
      ) {
        const impact = await ratesService.getVesImpact(
          vault.balance,
          rates.usd_official
        );
        setVesImpact(impact);
      } else {
        setVesImpact(null);
      }
    }
    void loadImpact();
  }, [vault.currency, vault.balance, rates?.usd_official]);

  const activeImpact = vesImpact ? vesImpact[period] : null;

  const typeOptions: SelectOption<VaultType>[] = [
    { value: 'bank', label: 'Banco Local', icon: <Landmark className="w-4 h-4" /> },
    { value: 'cash', label: 'Efectivo', icon: <Wallet className="w-4 h-4" /> },
    { value: 'binance', label: 'Billetera Digital', icon: <Coins className="w-4 h-4" /> },
  ];

  const currencyOptions: SelectOption<Currency>[] = [
    { value: 'USD', label: 'USD' },
    { value: 'USDT', label: 'USDT' },
    { value: 'VES', label: 'VES' },
    { value: 'EUR', label: 'EUR' },
  ];

  return (
    <div
      onClick={() => {
        if (!isEditing && onOpenDetails) {
          onOpenDetails(vault);
        }
      }}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 flex flex-col justify-between space-y-3 transition-all ${
        !isEditing
          ? 'hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer'
          : ''
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
        <div onClick={(e) => e.stopPropagation()} className="space-y-3 text-xs">
          <div>
            <label className="block font-title-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase font-mono text-[10px]">
              Nombre
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 outline-hidden bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-title-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CustomSelect<VaultType>
              label="Tipo"
              options={typeOptions}
              value={editType}
              onChange={(val) => setEditType(val)}
            />

            <CustomSelect<Currency>
              label="Moneda"
              options={currencyOptions}
              value={editCurrency}
              onChange={(val) => setEditCurrency(val)}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 font-title-bold cursor-pointer"
            >
              Eliminar
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingVault(null)}
                className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md font-title-bold cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-title-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {vault.type === 'binance'
                ? 'Billetera Digital'
                : vault.type === 'cash'
                  ? 'Efectivo'
                  : 'Banco Local'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                {vault.currency}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(vault);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 transition-colors cursor-pointer rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Editar Bóveda"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-base font-title-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {vault.name}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {getCurrencySymbol(vault.currency)}{' '}
                  {vault.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {/* Equivalente en $ para Bóvedas en Bolívares */}
                {vault.currency === 'VES' &&
                  rates &&
                  rates.usd_official > 0 && (
                    <div className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                      ≈ ${' '}
                      {(vault.balance / rates.usd_official).toLocaleString(
                        'en-US',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{' '}
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                        (BCV)
                      </span>
                    </div>
                  )}
                {/* Equivalente en Bs para Bóvedas en Divisas */}
                {vault.currency !== 'VES' && rates && (
                  <div className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                    ≈ Bs.{' '}
                    {(
                      vault.balance * getRateInVES(vault.currency, rates)
                    ).toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                      ({vault.currency === 'USDT' ? 'Binance' : 'BCV'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Impacto Cambiario en Bolívares */}
            {vault.currency === 'VES' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between min-h-[32px]"
              >
                <div className="inline-flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                  {(
                    [
                      { key: 'day1', label: 'Ayer' },
                      { key: 'days7', label: '7d' },
                      { key: 'days30', label: '30d' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPeriod(p.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-150 cursor-pointer select-none ${
                        period === p.key
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {activeImpact ? (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                      activeImpact.deltaUSD < 0
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                        : activeImpact.deltaUSD > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {activeImpact.deltaUSD < 0 ? (
                      <TrendingDown className="w-3 h-3 mr-1 shrink-0" />
                    ) : activeImpact.deltaUSD > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1 shrink-0" />
                    ) : (
                      <Minus className="w-3 h-3 mr-1 shrink-0" />
                    )}
                    {activeImpact.deltaUSD < 0
                      ? `-$${Math.abs(activeImpact.deltaUSD).toFixed(2)} USD`
                      : `+$${activeImpact.deltaUSD.toFixed(2)} USD`}
                  </span>
                ) : (
                  <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
