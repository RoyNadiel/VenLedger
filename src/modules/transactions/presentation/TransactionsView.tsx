import React, { useState } from 'react';
import { useTransactionsStore } from './useTransactionsStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import type { TransactionType } from '../../shared/domain/types';
import { ArrowLeftRight, Minus, MoveDown, MoveUp, Plus } from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, createTransaction, deleteTransaction } =
    useTransactionsStore();
  const { vaults } = useVaultsStore();
  const { rates } = useRatesStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [vaultId, setVaultId] = useState('');
  const [destinationVaultId, setDestinationVaultId] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAmount, setDestinationAmount] = useState('');
  const [note, setNote] = useState('');
  const [filterVaultId, setFilterVaultId] = useState('');

  const isTransfer = type === 'transfer' || type === 'buy_sell';
  const sourceVault = vaults.find((v) => v.id === vaultId);
  const destVault = vaults.find((v) => v.id === destinationVaultId);

  const isDifferentCurrency =
    isTransfer &&
    sourceVault &&
    destVault &&
    sourceVault.currency !== destVault.currency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const selectedVault = sourceVault || vaults[0];

    if (!selectedVault || isNaN(numAmount) || numAmount <= 0) return;

    if (isTransfer) {
      if (!destinationVaultId || destinationVaultId === selectedVault.id) {
        alert('Selecciona una bóveda de destino diferente a la de origen.');
        return;
      }

      let numDestAmount = parseFloat(destinationAmount);
      if (isDifferentCurrency) {
        if (isNaN(numDestAmount) || numDestAmount <= 0) {
          alert('Ingresa el monto recibido en la bóveda de destino.');
          return;
        }
      } else {
        numDestAmount = numAmount;
      }

      await createTransaction({
        vaultId: selectedVault.id,
        destinationVaultId,
        amount: numAmount,
        destinationAmount: numDestAmount,
        currency: selectedVault.currency,
        type,
        note:
          note || `Transferencia de ${selectedVault.name} a ${destVault?.name}`,
      });
    } else {
      await createTransaction({
        vaultId: selectedVault.id,
        amount: numAmount,
        currency: selectedVault.currency,
        type,
        note,
      });
    }

    setAmount('');
    setDestinationAmount('');
    setNote('');
  };

  // Sugerencia rápida de cálculo de tasa entre cualquier par de monedas
  const handleAutoCalculateDest = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !sourceVault || !destVault || !rates) return;

    const getRateInVES = (curr: string) => {
      switch (curr) {
        case 'VES':
          return 1;
        case 'USD':
          return rates.usd_official || 1;
        case 'USDT':
          return rates.usd_libre || 1;
        case 'EUR':
          return rates.eur_official || 1;
        default:
          return 1;
      }
    };

    const amountInVES = numAmount * getRateInVES(sourceVault.currency);
    const destRateInVES = getRateInVES(destVault.currency);
    const calculatedDestAmount = destRateInVES > 0 ? amountInVES / destRateInVES : 0;

    setDestinationAmount(calculatedDestAmount.toFixed(2));
  };

  return (
    <div className="space-y-4">
      {/* Formulario de Registro Rápido */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3">
          Nuevo Movimiento
        </h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tipo de Operación
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
              >
                <option value="expense">Gasto (Salida)</option>
                <option value="income">Ingreso (Entrada)</option>
                <option value="transfer">
                  Transferencia / Cambio entre Bóvedas
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {isTransfer ? 'Bóveda Origen (Sale)' : 'Bóveda'}
              </label>
              <select
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
                required
              >
                <option value="">Seleccionar bóveda...</option>
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.currency})
                  </option>
                ))}
              </select>
            </div>

            {isTransfer && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Bóveda Destino (Entra)
                </label>
                <select
                  value={destinationVaultId}
                  onChange={(e) => setDestinationVaultId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
                  required
                >
                  <option value="">Seleccionar destino...</option>
                  {vaults
                    .filter((v) => v.id !== vaultId)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.currency})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {isTransfer
                  ? `Monto Retirado (${sourceVault?.currency || 'Origen'})`
                  : 'Monto'}
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
                required
              />
            </div>

            {isDifferentCurrency && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-500">
                    Monto Recibido ({destVault?.currency})
                  </label>
                  {rates && (
                    <button
                      type="button"
                      onClick={handleAutoCalculateDest}
                      className="text-[10px] text-sky-600 hover:underline cursor-pointer"
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
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
                  required
                />
              </div>
            )}

            <div className={isDifferentCurrency ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
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
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isTransfer
                ? 'Registrar Transferencia / Cambio'
                : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Movimientos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Historial Reciente
          </h2>
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">
              Filtrar:
            </label>
            <select
              value={filterVaultId}
              onChange={(e) => setFilterVaultId(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="">Todas las bóvedas</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(() => {
          const filteredTxs = filterVaultId
            ? transactions.filter(
                (tx) =>
                  tx.vaultId === filterVaultId ||
                  tx.destinationVaultId === filterVaultId
              )
            : transactions;

          if (filteredTxs.length === 0) {
            return (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No hay movimientos registrados para el filtro seleccionado.
              </p>
            );
          }

          return (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {filteredTxs.map((tx) => {
                const vault = vaults.find((v) => v.id === tx.vaultId);
                const dest = vaults.find((v) => v.id === tx.destinationVaultId);
                const isIncome = tx.type === 'income';
                const isTxTransfer =
                  tx.type === 'transfer' || tx.type === 'buy_sell';

                // Contextualization when filtering by a specific vault
                const isFilteredVaultDest =
                  filterVaultId &&
                  isTxTransfer &&
                  tx.destinationVaultId === filterVaultId;
                const isFilteredVaultSource =
                  filterVaultId && isTxTransfer && tx.vaultId === filterVaultId;

                let iconSymbol = isIncome ? <Plus /> : <Minus />;
                let iconClass = isIncome
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700';

                if (isTxTransfer) {
                  if (isFilteredVaultDest) {
                    iconSymbol = <MoveDown />;
                    iconClass = 'bg-emerald-100 text-emerald-700';
                  } else if (isFilteredVaultSource) {
                    iconSymbol = <MoveUp />;
                    iconClass = 'bg-amber-100 text-amber-700';
                  } else {
                    iconSymbol = <ArrowLeftRight />;
                    iconClass = 'bg-sky-100 text-sky-700';
                  }
                }

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${iconClass}`}
                      >
                        {iconSymbol}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {tx.note ||
                            (isTxTransfer
                              ? isFilteredVaultDest
                                ? `Recibido de ${vault?.name || 'Bóveda'}`
                                : `Enviado a ${dest?.name || 'Bóveda'}`
                              : isIncome
                                ? 'Ingreso registrado'
                                : 'Gasto registrado')}
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1 mt-0.5">
                          {isTxTransfer ? (
                            <span className="font-semibold text-slate-600">
                              {vault?.name || 'Bóveda'} ➔{' '}
                              {dest?.name || 'Destino'}
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-600">
                              {vault?.name || 'Bóveda'}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(tx.createdAt).toLocaleDateString()}{' '}
                            {new Date(tx.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        {isTxTransfer ? (
                          isFilteredVaultDest ? (
                            <span className="text-sm font-bold text-emerald-600">
                              +{dest?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                              {(tx.destinationAmount ?? tx.amount).toFixed(2)}
                            </span>
                          ) : isFilteredVaultSource ? (
                            <span className="text-sm font-bold text-amber-700">
                              -{vault?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                              {tx.amount.toFixed(2)}
                            </span>
                          ) : (
                            <div className="flex flex-col items-end text-xs">
                              <span className="font-bold text-slate-700">
                                -{vault?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                                {tx.amount.toFixed(2)}
                              </span>
                              <span className="font-bold text-emerald-600">
                                +{dest?.currency === 'VES' ? 'Bs.' : '$'}{' '}
                                {(tx.destinationAmount ?? tx.amount).toFixed(2)}
                              </span>
                            </div>
                          )
                        ) : (
                          <span
                            className={`text-sm font-bold ${
                              isIncome ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {tx.currency === 'VES' ? 'Bs.' : '$'}{' '}
                            {tx.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => void deleteTransaction(tx.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Eliminar movimiento"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
