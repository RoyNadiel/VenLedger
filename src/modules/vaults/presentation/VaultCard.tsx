import React, { useEffect, useState } from 'react';
import type { Vault } from '../domain/entities';
import type {
  Currency,
  VaultType,
  ExchangeRates,
} from '../../shared/domain/types';
import { Pencil, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ConfirmModal } from '../../shared/presentation/ConfirmModal';
import { getCurrencySymbol, getRateInVES } from '../../shared/domain/currencyUtils';
import { ratesService } from '../../rates/application/ratesService';
import type { VesImpactPeriods } from '../../rates/domain/vesImpactEngine';

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
  const [period, setPeriod] = useState<'day1' | 'days7' | 'days30'>('days7');

  useEffect(() => {
    async function loadImpact() {
      if (vault.currency === 'VES' && vault.balance > 0 && rates?.usd_official) {
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

  return (
    <div
      onClick={() => {
        if (!isEditing && onOpenDetails) {
          onOpenDetails(vault);
        }
      }}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
        !isEditing ? 'hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md cursor-pointer' : ''
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
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              Nombre
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-sky-400 dark:border-sky-600 rounded-lg px-2 py-1 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                Tipo
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as VaultType)}
                className="w-full border border-sky-400 dark:border-sky-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden"
              >
                <option value="bank">Banco</option>
                <option value="cash">Efectivo</option>
                <option value="binance">Binance</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                Moneda
              </label>
              <select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value as Currency)}
                className="w-full border border-sky-400 dark:border-sky-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden"
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
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Eliminar
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingVault(null)}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium cursor-pointer"
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {vault.type === 'binance'
                ? 'Binance'
                : vault.type === 'cash'
                  ? 'Efectivo'
                  : 'Banco Local'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                {vault.currency}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(vault);
                }}
                className="text-xs text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 p-1 transition-colors cursor-pointer rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800"
                title="Editar Bóveda"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 transition-colors">
              {vault.name}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {getCurrencySymbol(vault.currency)}{' '}
                  {vault.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {/* Equivalente en $ para Bóvedas en Bolívares (Tasa BCV) */}
                {vault.currency === 'VES' &&
                  rates &&
                  rates.usd_official > 0 && (
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      ≈ ${' '}
                      {(vault.balance / rates.usd_official).toLocaleString(
                        'en-US',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{' '}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        (Tasa BCV)
                      </span>
                    </div>
                  )}
                {/* Equivalente en Bs para Bóvedas en Divisas */}
                {vault.currency !== 'VES' && rates && (
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    ≈ Bs.{' '}
                    {(
                      vault.balance * getRateInVES(vault.currency, rates)
                    ).toLocaleString('es-VE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      ({vault.currency === 'USDT' ? 'Binance' : 'BCV'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selector e Indicador de Pérdida / Ganancia para Bolívares */}
            {vault.currency === 'VES' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between min-h-[32px]"
              >
                <div className="inline-flex items-center p-0.5 bg-slate-900/5 dark:bg-slate-100/10 rounded-full border border-slate-900/5 dark:border-slate-100/10 backdrop-blur-xs">
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
                      className={`px-2.5 py-0.5 rounded-full text-xs transition-all duration-150 cursor-pointer select-none ${
                        period === p.key
                          ? 'bg-white dark:bg-slate-800 text-sky-950 dark:text-sky-200 font-bold shadow-xs ring-1 ring-slate-900/10 dark:ring-slate-100/10 scale-[1.02]'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {activeImpact ? (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-extrabold border ${
                      activeImpact.deltaUSD < 0
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : activeImpact.deltaUSD > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                    title={`Pérdida/Ganancia calculada comparado con la tasa de ${
                      period === 'day1' ? 'ayer' : period === 'days7' ? 'hace 7 días' : 'hace 30 días'
                    } (${activeImpact.pastRate.toFixed(2)} Bs/USD)`}
                  >
                    {activeImpact.deltaUSD < 0 ? (
                      <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />
                    ) : activeImpact.deltaUSD > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" />
                    ) : (
                      <Minus className="w-3 h-3 mr-0.5 shrink-0" />
                    )}
                    {activeImpact.deltaUSD < 0
                      ? `-$${Math.abs(activeImpact.deltaUSD).toFixed(2)} USD`
                      : `+$${activeImpact.deltaUSD.toFixed(2)} USD`}
                  </span>
                ) : (
                  <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
