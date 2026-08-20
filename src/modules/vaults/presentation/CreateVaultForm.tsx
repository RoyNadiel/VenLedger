import React from 'react';
import type { Currency, VaultType } from '../../shared/domain/types';
import {
  CustomSelect,
  type SelectOption,
} from '../../shared/presentation/CustomSelect';
import { Landmark, Wallet, Coins } from 'lucide-react';

export interface CreateVaultFormProps {
  newName: string;
  setNewName: (val: string) => void;
  newType: VaultType;
  setNewType: (val: VaultType) => void;
  newCurrency: Currency;
  setNewCurrency: (val: Currency) => void;
  newBalance: string;
  setNewBalance: (val: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
}

export const CreateVaultForm: React.FC<CreateVaultFormProps> = ({
  newName,
  setNewName,
  newType,
  setNewType,
  newCurrency,
  setNewCurrency,
  newBalance,
  setNewBalance,
  onSubmit,
}) => {
  const typeOptions: SelectOption<VaultType>[] = [
    {
      value: 'bank',
      label: 'Banco Local / Digital',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      value: 'cash',
      label: 'Efectivo',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      value: 'binance',
      label: 'Billetera Digital (Binance, Kontigo, Zelle...)',
      icon: <Coins className="w-4 h-4" />,
    },
  ];

  const currencyOptions: SelectOption<Currency>[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'USDT', label: 'USDT (Crypto / Ref. Dólar)' },
    { value: 'VES', label: 'VES (Bs.)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="pb-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 transition-colors"
    >
      <h3 className="text-xs font-title-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
        Crear Nueva Bóveda
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
            Nombre
          </label>
          <input
            type="text"
            placeholder="Ej. Zinli, Zelle, Kontigo, Banesco"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full text-xs font-title-semibold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
            required
          />
        </div>

        <CustomSelect<VaultType>
          label="Tipo de Bóveda"
          headerTitle="Tipo de Bóveda"
          options={typeOptions}
          value={newType}
          onChange={(val) => setNewType(val)}
        />

        <CustomSelect<Currency>
          label="Moneda Base"
          headerTitle="Moneda Base"
          options={currencyOptions}
          value={newCurrency}
          onChange={(val) => setNewCurrency(val)}
        />

        <div>
          <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
            Saldo Inicial
          </label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-title-bold text-xs rounded-md transition-colors cursor-pointer"
        >
          Guardar Bóveda
        </button>
      </div>
    </form>
  );
};
