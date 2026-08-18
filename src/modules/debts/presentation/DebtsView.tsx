import React, { useState } from 'react';
import { useDebtsStore } from './useDebtsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { FinanceEngine } from '../../analytics/domain/financeEngine';
import { ReceiptModal } from './ReceiptModal';
import type { AgreementType, Currency, DebtType } from '../../shared/domain/types';
import type { Debt } from '../domain/entities';
import { CheckCircle2, Clock, History } from 'lucide-react';
import { convertCurrency, getCurrencySymbol, getPaymentRateInfo } from '../../shared/domain/currencyUtils';

export const DebtsView: React.FC = () => {
  const {
    debts,
    paymentsByDebtId,
    createDebt,
    addPayment,
    loadPaymentsForDebt,
    markDebtStatus,
  } = useDebtsStore();
  const { rates } = useRatesStore();
  const { vaults } = useVaultsStore();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedDebtForReceipt, setSelectedDebtForReceipt] =
    useState<Debt | null>(null);

  // Estados para crear deuda
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [type, setType] = useState<DebtType>('receivable');
  const [agreementType, setAgreementType] =
    useState<AgreementType>('fixed_usdt');
  const [initialPayment, setInitialPayment] = useState('');
  const [initialVaultId, setInitialVaultId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Estado para registrar abono
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentVaultId, setPaymentVaultId] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const activeDebts = debts.filter((d) => d.status !== 'paid');
  const completedDebts = debts.filter((d) => d.status === 'paid');

  const selectedInitialVault = vaults.find((v) => v.id === initialVaultId);

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const amount = parseFloat(totalAmount);
    if (!contactName || isNaN(amount) || amount <= 0) return;

    const initPay = parseFloat(initialPayment);
    const hasInitialPayment = !isNaN(initPay) && initPay > 0;

    if (hasInitialPayment) {
      const targetCurrency = selectedInitialVault
        ? selectedInitialVault.currency
        : currency;
      const debtInVaultCurrency = selectedInitialVault
        ? convertCurrency(amount, currency, targetCurrency, rates)
        : amount;

      if (initPay > debtInVaultCurrency + 0.01) {
        setCreateError(
          `El abono inicial no puede superar el monto de la deuda (${debtInVaultCurrency.toFixed(2)} ${targetCurrency})`
        );
        return;
      }
      if (
        type === 'payable' &&
        selectedInitialVault &&
        initPay > selectedInitialVault.balance + 0.01
      ) {
        setCreateError(
          `El abono inicial excede el saldo de la bóveda (${selectedInitialVault.balance.toFixed(2)} ${selectedInitialVault.currency})`
        );
        return;
      }
    }

    const newDebt = await createDebt({
      contactName,
      contactPhone,
      totalAmount: amount,
      currency,
      type,
      agreementType,
    });

    if (hasInitialPayment && rates && newDebt) {
      const paymentCurrency = selectedInitialVault
        ? selectedInitialVault.currency
        : currency;

      const { rateUsed, rateType } = getPaymentRateInfo(paymentCurrency, rates);

      await addPayment({
        debtId: newDebt.id,
        amount: initPay,
        currency: paymentCurrency,
        rateUsed,
        rateType,
        usdLibreAtPayment: rates.usd_libre,
        vaultId: initialVaultId || undefined,
      });
    }

    setContactName('');
    setContactPhone('');
    setTotalAmount('');
    setInitialPayment('');
    setInitialVaultId('');
    setCreateError(null);
  };

  const handleAddPayment = async (debt: Debt) => {
    setPaymentError(null);
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || !rates) return;

    const selectedVault = vaults.find((v) => v.id === paymentVaultId);
    const payments = paymentsByDebtId[debt.id] || [];
    const calc = FinanceEngine.calculateDebtBalance(debt, payments, rates);

    const remainingInVaultCurrency = selectedVault
      ? convertCurrency(
          calc.remainingAmountOriginal,
          debt.currency,
          selectedVault.currency,
          rates
        )
      : calc.remainingAmountOriginal;

    if (amount > remainingInVaultCurrency + 0.01) {
      setPaymentError(
        `El abono excede el saldo pendiente de la deuda (${remainingInVaultCurrency.toFixed(2)} ${selectedVault ? selectedVault.currency : debt.currency})`
      );
      return;
    }

    if (
      debt.type === 'payable' &&
      selectedVault &&
      amount > selectedVault.balance + 0.01
    ) {
      setPaymentError(
        `El abono excede el saldo disponible en la bóveda (${selectedVault.balance.toFixed(2)} ${selectedVault.currency})`
      );
      return;
    }

    const paymentCurrency = selectedVault
      ? selectedVault.currency
      : debt.currency;

    const { rateUsed, rateType } = getPaymentRateInfo(paymentCurrency, rates);

    await addPayment({
      debtId: debt.id,
      amount,
      currency: paymentCurrency,
      rateUsed,
      rateType,
      usdLibreAtPayment: rates.usd_libre,
      vaultId: paymentVaultId || undefined,
    });

    setPaymentAmount('');
    setPaymentVaultId('');
    setPaymentDebtId(null);
    setPaymentError(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Formulario para registrar nueva deuda */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
          Registrar Nueva Deuda / Préstamo
        </h2>
        <form
          onSubmit={(e) => void handleCreateDebt(e)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Contacto / Persona
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Teléfono WhatsApp (Opcional)
            </label>
            <input
              type="tel"
              placeholder="+58412..."
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-400 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tipo de Deuda
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DebtType)}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="receivable">Por Cobrar (Me deben)</option>
              <option value="payable">Por Pagar (Yo debo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Monto Original
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Moneda Base
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="USD">USD ($)</option>
              <option value="USDT">USDT (Cryptocurrency)</option>
              <option value="EUR">EUR (€)</option>
              <option value="VES">Bolívares (VES)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tipo de Acuerdo
            </label>
            <select
              value={agreementType}
              onChange={(e) =>
                setAgreementType(e.target.value as AgreementType)
              }
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="fixed_usdt">Congelado en Divisas</option>
              <option value="floating_ves">Flotante en Bolívares</option>
            </select>
          </div>

          {/* Abono Inicial Opcional */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Abono Inicial (Opcional)
              </label>
              {selectedInitialVault && (
                <button
                  type="button"
                  onClick={() => {
                    const debtAmt = parseFloat(totalAmount) || 0;
                    const debtInVaultCurrency = convertCurrency(
                      debtAmt,
                      currency,
                      selectedInitialVault.currency,
                      rates
                    );
                    const maxVal =
                      debtAmt > 0
                        ? type === 'payable'
                          ? Math.min(debtInVaultCurrency, selectedInitialVault.balance)
                          : debtInVaultCurrency
                        : selectedInitialVault.balance;
                    setInitialPayment(maxVal > 0 ? maxVal.toFixed(2) : '');
                    setCreateError(null);
                  }}
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  Máx ({selectedInitialVault.balance.toFixed(2)} {selectedInitialVault.currency})
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={initialPayment}
              onChange={(e) => {
                setInitialPayment(e.target.value);
                setCreateError(null);
              }}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-400 outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Bóveda para Abono Inicial
            </label>
            <select
              value={initialVaultId}
              onChange={(e) => {
                setInitialVaultId(e.target.value);
                setCreateError(null);
              }}
              className="w-full text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="">Sin bóveda (no afecta saldos)</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — Saldo: {v.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {v.currency}
                </option>
              ))}
            </select>
          </div>

          {createError && (
            <div className="sm:col-span-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-2.5">
              ⚠️ {createError}
            </div>
          )}

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Registrar Deuda
            </button>
          </div>
        </form>
      </div>

      {/* Control de Pestañas: Activas vs Saldadas */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'active'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Deudas Activas ({activeDebts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial Saldadas ({completedDebts.length})</span>
          </button>
        </div>
      </div>

      {/* Lista según Pestaña Selección */}
      {activeTab === 'active' ? (
        <div className="space-y-3">
          {activeDebts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
              No tienes deudas activas pendientes.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeDebts.map((debt) => {
                const payments = paymentsByDebtId[debt.id] || [];
                const calc = rates
                  ? FinanceEngine.calculateDebtBalance(debt, payments, rates)
                  : null;
                const isReceivable = debt.type === 'receivable';

                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-2xl border ${
                      isReceivable ? 'pastel-blue-card' : 'pastel-pink-card'
                    } space-y-3 shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          {isReceivable ? 'Por Cobrar' : 'Por Pagar'}
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          {debt.contactName}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">
                        {debt.agreementType === 'floating_ves'
                          ? 'Bs Flotante'
                          : 'Congelado en Divisas'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                      <div>
                        <div className="text-slate-400">Monto Inicial</div>
                        <div className="font-bold text-slate-800">
                          {getCurrencySymbol(debt.currency)}{' '}
                          {debt.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Saldo Pendiente</div>
                        <div className="font-extrabold text-sky-950">
                          {getCurrencySymbol(debt.currency)}{' '}
                          {calc
                            ? calc.remainingAmountOriginal.toFixed(2)
                            : '...'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {paymentDebtId === debt.id ? (
                        <div className="flex flex-col gap-1.5 w-full bg-white p-2 rounded-xl border border-sky-300">
                          <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full">
                            <div className="relative w-full">
                              <input
                                type="number"
                                step="any"
                                placeholder="Monto abono"
                                value={paymentAmount}
                                onChange={(e) => {
                                  setPaymentAmount(e.target.value);
                                  setPaymentError(null);
                                }}
                                className="w-full text-xs px-2 py-1 pr-12 border border-slate-300 rounded-lg focus:outline-hidden"
                              />
                              {(() => {
                                const selV = vaults.find((v) => v.id === paymentVaultId);
                                if (!selV) return null;
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const remOriginal =
                                        calc?.remainingAmountOriginal ?? debt.totalAmount;
                                      const remInVaultCurrency = convertCurrency(
                                        remOriginal,
                                        debt.currency,
                                        selV.currency,
                                        rates
                                      );
                                      const maxVal =
                                        debt.type === 'payable'
                                          ? Math.min(selV.balance, remInVaultCurrency)
                                          : remInVaultCurrency;
                                      setPaymentAmount(maxVal > 0 ? maxVal.toFixed(2) : '');
                                      setPaymentError(null);
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded cursor-pointer"
                                  >
                                    Máx
                                  </button>
                                );
                              })()}
                            </div>
                            <select
                              value={paymentVaultId}
                              onChange={(e) => {
                                setPaymentVaultId(e.target.value);
                                setPaymentError(null);
                              }}
                              className="w-full text-xs px-2 py-1 border border-slate-300 rounded-lg focus:outline-hidden bg-slate-50"
                            >
                              <option value="">Bóveda (opcional)...</option>
                              {vaults.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} ({v.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {v.currency})
                                </option>
                              ))}
                            </select>
                            <div className="flex space-x-1 shrink-0">
                              <button
                                onClick={() => void handleAddPayment(debt)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => {
                                  setPaymentDebtId(null);
                                  setPaymentError(null);
                                }}
                                className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          {paymentError && (
                            <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                              ⚠️ {paymentError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                          <button
                            onClick={() => {
                              setPaymentDebtId(debt.id);
                              void loadPaymentsForDebt(debt.id);
                            }}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            + Registrar Abono
                          </button>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                void loadPaymentsForDebt(debt.id);
                                setSelectedDebtForReceipt(debt);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Ticket
                            </button>
                            <button
                              onClick={() => void markDebtStatus(debt.id, 'paid')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                              title="Marcar como completamente saldada"
                            >
                              Saldar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {completedDebts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
              Aún no hay deudas saldadas en el historial.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedDebts.map((debt) => {
                const payments = paymentsByDebtId[debt.id] || [];
                const calc = rates
                  ? FinanceEngine.calculateDebtBalance(debt, payments, rates)
                  : null;
                const isReceivable = debt.type === 'receivable';

                return (
                  <div
                    key={debt.id}
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {isReceivable ? 'Cobrada Totalmente' : 'Pagada Totalmente'}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {debt.contactName}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Saldada
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <div>
                        <div className="text-slate-400">Monto Inicial</div>
                        <div className="font-bold text-slate-800">
                          {getCurrencySymbol(debt.currency)}{' '}
                          {debt.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Total Abonado</div>
                        <div className="font-extrabold text-emerald-700">
                          $ {calc ? calc.totalPaidUSDT.toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => {
                          void loadPaymentsForDebt(debt.id);
                          setSelectedDebtForReceipt(debt);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Ver Comprobante Ticket
                      </button>

                      <button
                        onClick={() =>
                          void markDebtStatus(
                            debt.id,
                            payments.length > 0 ? 'partially_paid' : 'pending'
                          )
                        }
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium underline cursor-pointer"
                      >
                        Reabrir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Comprobante si está activo */}
      {selectedDebtForReceipt && (
        <ReceiptModal
          debt={selectedDebtForReceipt}
          payments={paymentsByDebtId[selectedDebtForReceipt.id] || []}
          rates={rates}
          onClose={() => setSelectedDebtForReceipt(null)}
        />
      )}
    </div>
  );
};
