import React from 'react';
import type { TransactionType, ExchangeRates } from '../../shared/domain/types';
import type { Vault } from '../../vaults/domain/entities';
import type { Category } from '../../categories/domain/entities';
import { getCurrencySymbol } from '../../shared/domain/currencyUtils';
import { CustomSelect, type SelectOption } from '../../shared/presentation/CustomSelect';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Landmark,
  Wallet,
  Coins,
} from 'lucide-react';

export interface TransactionFormProps {
  type: TransactionType;
  setType: (type: TransactionType) => void;
  vaultId: string;
  setVaultId: (id: string) => void;
  destinationVaultId: string;
  setDestinationVaultId: (id: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  destinationAmount: string;
  setDestinationAmount: (amount: string) => void;
  categoryId?: string;
  setCategoryId?: (id: string) => void;
  note: string;
  setNote: (note: string) => void;
  fee?: string;
  setFee?: (fee: string) => void;
  vaults: Vault[];
  categories?: Category[];
  rates: ExchangeRates | null;
  onSubmit: (e: React.FormEvent) => void;
  onAutoCalculateDest: () => void;
  onFillMax?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  setType,
  vaultId,
  setVaultId,
  destinationVaultId,
  setDestinationVaultId,
  amount,
  setAmount,
  destinationAmount,
  setDestinationAmount,
  categoryId = '',
  setCategoryId,
  note,
  setNote,
  fee = '',
  setFee,
  vaults,
  categories = [],
  rates,
  onSubmit,
  onAutoCalculateDest,
  onFillMax,
}) => {
  const isTransfer = type === 'transfer' || type === 'buy_sell';
  const sourceVault = vaults.find((v) => v.id === vaultId);
  const destVault = vaults.find((v) => v.id === destinationVaultId);
  const isDifferentCurrency =
    isTransfer &&
    sourceVault &&
    destVault &&
    sourceVault.currency !== destVault.currency;

  const filteredCategories = categories.filter(
    (c) => c.type === (type === 'income' ? 'income' : 'expense')
  );

  const getVaultIcon = (vaultType: string) => {
    switch (vaultType) {
      case 'binance':
        return <Coins className="w-4 h-4" />;
      case 'bank':
        return <Landmark className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const typeOptions: SelectOption<TransactionType>[] = [
    {
      value: 'expense',
      label: 'Gasto (Salida)',
      icon: <ArrowDownRight className="w-4 h-4 text-red-500" />,
    },
    {
      value: 'income',
      label: 'Ingreso (Entrada)',
      icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />,
    },
    {
      value: 'transfer',
      label: 'Transferencia / Cambio',
      icon: <ArrowLeftRight className="w-4 h-4 text-sky-500" />,
    },
  ];

  const vaultOptions: SelectOption[] = vaults.map((v) => ({
    value: v.id,
    label: v.name,
    sublabel: v.currency,
    icon: getVaultIcon(v.type),
    extraText: `${getCurrencySymbol(v.currency)} ${v.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));

  const destVaultOptions: SelectOption[] = vaults
    .filter((v) => v.id !== vaultId)
    .map((v) => ({
      value: v.id,
      label: v.name,
      sublabel: v.currency,
      icon: getVaultIcon(v.type),
      extraText: `${getCurrencySymbol(v.currency)} ${v.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    }));

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'Sin categoría...' },
    ...filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  return (
    <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <h2 className="text-xs font-title-bold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider font-mono">
        Nuevo Movimiento
      </h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CustomSelect<TransactionType>
            label="Tipo de Operación"
            headerTitle="Operación"
            options={typeOptions}
            value={type}
            onChange={(val) => setType(val)}
          />

          <CustomSelect
            label={isTransfer ? 'Bóveda Origen' : 'Bóveda'}
            headerTitle="Bóveda de Origen"
            options={vaultOptions}
            value={vaultId}
            onChange={(val) => setVaultId(val)}
            placeholder="Seleccionar bóveda..."
          />

          {isTransfer ? (
            <CustomSelect
              label="Bóveda Destino"
              headerTitle="Bóveda de Destino"
              options={destVaultOptions}
              value={destinationVaultId}
              onChange={(val) => setDestinationVaultId(val)}
              placeholder="Seleccionar destino..."
            />
          ) : (
            <CustomSelect
              label="Categoría (Opcional)"
              headerTitle="Categoría"
              options={categoryOptions}
              value={categoryId}
              onChange={(val) => setCategoryId?.(val)}
              placeholder="Sin categoría..."
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 uppercase font-mono">
                {isTransfer
                  ? `Monto Retirado (${sourceVault?.currency || 'Origen'})`
                  : 'Monto'}
              </label>
              {isTransfer && sourceVault && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(String(sourceVault.balance));
                    onFillMax?.();
                  }}
                  className="text-[10px] font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                  title={`Saldo disponible: ${sourceVault.balance}`}
                >
                  MÁX
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
              required
            />
            {isTransfer && sourceVault && (
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Disponible:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {getCurrencySymbol(sourceVault.currency)}{' '}
                  {sourceVault.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {isDifferentCurrency && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 uppercase font-mono">
                  Monto Recibido ({destVault?.currency})
                </label>
                {rates && (
                  <button
                    type="button"
                    onClick={onAutoCalculateDest}
                    className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    Calc. Tasa
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={destinationAmount}
                onChange={(e) => setDestinationAmount(e.target.value)}
                className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
                required
              />
            </div>
          )}

          <div className={isDifferentCurrency ? '' : 'sm:col-span-2'}>
            <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
              Nota / Detalle
            </label>
            <input
              type="text"
              placeholder={
                isTransfer
                  ? 'Ej. Venta Binance P2P a Banco'
                  : 'Ej. Mercado, Pago servicio'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
            />
          </div>
        </div>

        {/* Sección opcional de Comisión Bancaria (para gastos o transferencias) */}
        {(type === 'expense' || isTransfer) && setFee && (
          <div className="pt-1">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 uppercase font-mono">
                Comisión Bancaria / Fee ({sourceVault?.currency || 'Opcional'})
              </label>
              <div className="flex items-center space-x-1.5">
                {(!sourceVault || sourceVault.currency === 'VES') && (
                  <button
                    type="button"
                    onClick={() => {
                      const numAmt = parseFloat(amount) || 0;
                      const calculated = Math.max(14, numAmt * 0.003);
                      setFee(calculated.toFixed(2));
                    }}
                    className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                    title="0.30% con un mínimo de 14.00 Bs (BDV / Pago Móvil)"
                  >
                    0.3% BDV (Mín. 14 Bs)
                  </button>
                )}
                {sourceVault && sourceVault.currency !== 'VES' && (
                  <button
                    type="button"
                    onClick={() => {
                      const numAmt = parseFloat(amount) || 0;
                      const calculated = numAmt * 0.03;
                      setFee(calculated.toFixed(2));
                    }}
                    className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                    title="3% IGTF (Transacciones Financieras)"
                  >
                    3% IGTF
                  </button>
                )}
                {fee && parseFloat(fee) > 0 && (
                  <button
                    type="button"
                    onClick={() => setFee('')}
                    className="text-[10px] font-mono font-bold text-zinc-400 hover:text-red-500 cursor-pointer"
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>
            </div>
            <input
              type="number"
              step="any"
              placeholder="0.00 (Monto comisión)"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full sm:w-1/3 text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-title-bold text-xs rounded-md transition-colors cursor-pointer"
          >
            {isTransfer
              ? 'Registrar Transferencia'
              : 'Guardar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};
