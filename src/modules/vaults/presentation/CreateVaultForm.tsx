import React from 'react';
import type { Currency, VaultType } from '../../shared/domain/types';

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
  return (
    <form
      onSubmit={onSubmit}
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
  );
};
