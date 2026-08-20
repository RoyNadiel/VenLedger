import React, { useState } from 'react';
import { useDebtsStore } from './useDebtsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { FinanceEngine } from '../../analytics/domain/financeEngine';
import { ReceiptModal } from './ReceiptModal';
import type { AgreementType, Currency, DebtType, ExchangeRates } from '../../shared/domain/types';
import type { Debt } from '../domain/entities';
import { CheckCircle2, Clock, Landmark, Wallet, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { convertCurrency, getCurrencySymbol, getPaymentRateInfo } from '../../shared/domain/currencyUtils';
import { CustomSelect, type SelectOption } from '../../shared/presentation/CustomSelect';

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

  const typeOptions: SelectOption<DebtType>[] = [
    {
      value: 'receivable',
      label: 'Por Cobrar (Me deben)',
      icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />,
    },
    {
      value: 'payable',
      label: 'Por Pagar (Yo debo)',
      icon: <ArrowDownRight className="w-4 h-4 text-red-500" />,
    },
  ];

  const currencyOptions: SelectOption<Currency>[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'USDT', label: 'USDT (Cryptocurrency)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'VES', label: 'Bolívares (VES)' },
  ];

  const agreementTypeOptions: SelectOption<AgreementType>[] = [
    { value: 'fixed_usdt', label: 'Congelado en Divisas' },
    { value: 'floating_ves', label: 'Flotante en Bolívares' },
  ];

  const initialVaultOptions: SelectOption[] = [
    { value: '', label: 'Sin bóveda (no afecta saldos)' },
    ...vaults.map((v) => ({
      value: v.id,
      label: v.name,
      sublabel: v.currency,
      icon: getVaultIcon(v.type),
      extraText: `${v.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${v.currency}`,
    })),
  ];

  const paymentVaultOptions: SelectOption[] = [
    { value: '', label: 'Bóveda (opcional)...' },
    ...vaults.map((v) => ({
      value: v.id,
      label: v.name,
      sublabel: v.currency,
      icon: getVaultIcon(v.type),
      extraText: `${v.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${v.currency}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Formulario para registrar nueva deuda */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <h2 className="text-xs font-title-bold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider font-mono">
          Registrar Nueva Deuda / Préstamo
        </h2>
        <form
          onSubmit={(e) => void handleCreateDebt(e)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div>
            <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
              Contacto / Persona
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-xs font-title-semibold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
              Teléfono WhatsApp (Opcional)
            </label>
            <input
              type="tel"
              placeholder="+58412..."
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full text-xs font-mono font-medium border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
            />
          </div>

          <CustomSelect<DebtType>
            label="Tipo de Deuda"
            headerTitle="Tipo de Deuda"
            options={typeOptions}
            value={type}
            onChange={(val) => setType(val)}
          />

          <div>
            <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase font-mono">
              Monto Original
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
              required
            />
          </div>

          <CustomSelect<Currency>
            label="Moneda Base"
            headerTitle="Moneda Base"
            options={currencyOptions}
            value={currency}
            onChange={(val) => setCurrency(val)}
          />

          <CustomSelect<AgreementType>
            label="Tipo de Acuerdo"
            headerTitle="Tipo de Acuerdo"
            options={agreementTypeOptions}
            value={agreementType}
            onChange={(val) => setAgreementType(val)}
          />

          {/* Abono Inicial Opcional */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-title-bold text-zinc-500 dark:text-zinc-400 uppercase font-mono">
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
                  className="text-[10px] font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  MÁX ({selectedInitialVault.balance.toFixed(2)} {selectedInitialVault.currency})
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
              className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <CustomSelect
              label="Bóveda para Abono Inicial"
              headerTitle="Bóveda"
              options={initialVaultOptions}
              value={initialVaultId}
              onChange={(val) => {
                setInitialVaultId(val);
                setCreateError(null);
              }}
            />
          </div>

          {createError && (
            <div className="sm:col-span-3 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md p-2.5">
              ⚠️ {createError}
            </div>
          )}

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-title-bold text-xs rounded-md transition-colors cursor-pointer"
            >
              Guardar Deuda
            </button>
          </div>
        </form>
      </div>

      {/* Tabs para alternar entre activas y saldadas */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-title-semibold transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-title-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Deudas Activas ({activeDebts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-title-semibold transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-title-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Saldadas ({completedDebts.length})</span>
        </button>
      </div>

      {/* Lista de deudas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'active' ? activeDebts : completedDebts).map((debt) => {
          const payments = paymentsByDebtId[debt.id] || [];
          const fallbackRates: ExchangeRates = rates || {
            usd_official: 1,
            eur_official: 1,
            usd_libre: 1,
            timestamp: new Date().toISOString(),
          };
          const calc = FinanceEngine.calculateDebtBalance(debt, payments, fallbackRates);
          const isReceivable = debt.type === 'receivable';

          return (
            <div
              key={debt.id}
              className="border-b border-zinc-200 dark:border-zinc-800 pb-4 pt-1 px-1 space-y-3 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-title-bold px-2 py-0.5 rounded border uppercase font-mono ${
                      isReceivable
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
                    }`}
                  >
                    {isReceivable ? 'Por Cobrar' : 'Por Pagar'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {debt.agreementType === 'fixed_usdt'
                      ? 'Congelado USD'
                      : 'Flotante Bs'}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-base font-title-bold text-zinc-900 dark:text-zinc-100">
                    {debt.contactName}
                  </h3>
                  {debt.contactPhone && (
                    <p className="text-xs font-mono text-zinc-400">{debt.contactPhone}</p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-title-semibold">
                      Monto Original:
                    </span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {getCurrencySymbol(debt.currency)}{' '}
                      {debt.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span className="text-zinc-900 dark:text-zinc-100 font-title-bold">
                      Saldo Pendiente:
                    </span>
                    <span className="font-mono text-zinc-900 dark:text-zinc-100">
                      {getCurrencySymbol(debt.currency)}{' '}
                      {calc.remainingAmountOriginal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {debt.currency !== 'VES' && rates && (
                    <div className="flex justify-between text-xs font-mono text-zinc-500">
                      <span>Eq. en Bolívares (P2P):</span>
                      <span>
                        Bs.{' '}
                        {(calc.remainingAmountOriginal * rates.usd_libre).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones de abono / comprobante */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col space-y-2">
                {paymentDebtId === debt.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Monto a abonar"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 outline-hidden"
                      />
                      <button
                        onClick={() => void handleAddPayment(debt)}
                        className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-title-bold text-xs rounded-md cursor-pointer shrink-0"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setPaymentDebtId(null);
                          setPaymentError(null);
                        }}
                        className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-title-semibold text-xs rounded-md cursor-pointer shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <CustomSelect
                      options={paymentVaultOptions}
                      value={paymentVaultId}
                      onChange={(val) => setPaymentVaultId(val)}
                      placeholder="Bóveda (opcional)..."
                    />

                    {paymentError && (
                      <div className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md p-1.5">
                        ⚠️ {paymentError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full gap-2">
                    {debt.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setPaymentDebtId(debt.id);
                          void loadPaymentsForDebt(debt.id);
                        }}
                        className="px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-title-bold text-xs rounded-md transition-colors cursor-pointer"
                      >
                        + Registrar Abono
                      </button>
                    )}

                    <div className="flex space-x-1.5 ml-auto">
                      <button
                        onClick={() => {
                          void loadPaymentsForDebt(debt.id);
                          setSelectedDebtForReceipt(debt);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-title-semibold text-xs rounded-md transition-colors cursor-pointer"
                      >
                        Ticket
                      </button>
                      {debt.status !== 'paid' && (
                        <button
                          onClick={() => void markDebtStatus(debt.id, 'paid')}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-title-bold text-xs rounded-md transition-colors cursor-pointer"
                          title="Marcar como completamente saldada"
                        >
                          Saldar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Comprobante Visual */}
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
