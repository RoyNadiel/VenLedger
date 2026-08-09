import React, { useState } from 'react';
import { useDebtsStore } from './useDebtsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { FinanceEngine } from '../../analytics/domain/financeEngine';
import { ReceiptModal } from './ReceiptModal';
import type { AgreementType, Currency, DebtType } from '../../shared/domain/types';
import type { Debt } from '../domain/entities';

export const DebtsView: React.FC = () => {
  const { debts, paymentsByDebtId, createDebt, addPayment, loadPaymentsForDebt } = useDebtsStore();
  const { rates } = useRatesStore();
  const { vaults } = useVaultsStore();

  const [selectedDebtForReceipt, setSelectedDebtForReceipt] = useState<Debt | null>(null);

  // Estados para crear deuda
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [type, setType] = useState<DebtType>('receivable');
  const [agreementType, setAgreementType] = useState<AgreementType>('fixed_usdt');

  // Estado para registrar abono
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentVaultId, setPaymentVaultId] = useState('');

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(totalAmount);
    if (!contactName || isNaN(amount) || amount <= 0) return;

    await createDebt({
      contactName,
      contactPhone,
      totalAmount: amount,
      currency,
      type,
      agreementType,
    });

    setContactName('');
    setContactPhone('');
    setTotalAmount('');
  };

  const handleAddPayment = async (debt: Debt) => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || !rates) return;

    const selectedVault = vaults.find((v) => v.id === paymentVaultId);
    const paymentCurrency = selectedVault ? selectedVault.currency : debt.currency;

    const isFloating = debt.agreementType === 'floating_ves';
    const rateUsed = isFloating ? rates.usd_official : rates.usd_libre;
    const rateType = isFloating ? 'bcv' : 'libre';

    await addPayment({
      debtId: debt.id,
      amount,
      currency: paymentCurrency,
      rateUsed,
      rateType,
      vaultId: paymentVaultId || undefined,
    });

    setPaymentAmount('');
    setPaymentVaultId('');
    setPaymentDebtId(null);
  };

  return (
    <div className="space-y-4">
      {/* Formulario para registrar nueva deuda */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Registrar Nueva Deuda / Préstamo</h2>
        <form onSubmit={(e) => void handleCreateDebt(e)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto / Persona</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Teléfono WhatsApp (Opcional)</label>
            <input
              type="tel"
              placeholder="+58412..."
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Deuda</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DebtType)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="receivable">Por Cobrar (Me deben)</option>
              <option value="payable">Por Pagar (Yo debo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Monto Original</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Moneda Base</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="USD">USD ($)</option>
              <option value="USDT">USDT (Cryptocurrency)</option>
              <option value="EUR">EUR (€)</option>
              <option value="VES">Bolívares (VES)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Acuerdo</label>
            <select
              value={agreementType}
              onChange={(e) => setAgreementType(e.target.value as AgreementType)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-hidden"
            >
              <option value="fixed_usdt">Congelado en Divisas</option>
              <option value="floating_ves">Flotante en Bolívares</option>
            </select>
          </div>

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

      {/* Lista de Deudas Activas */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 px-1">Deudas y Abonos Parciales</h2>
        {debts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
            No tienes deudas ni préstamos registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {debts.map((debt) => {
              const payments = paymentsByDebtId[debt.id] || [];
              const calc = rates ? FinanceEngine.calculateDebtBalance(debt, payments, rates) : null;
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
                      <h3 className="text-base font-black text-slate-900">{debt.contactName}</h3>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">
                      {debt.agreementType === 'floating_ves' ? 'Bs Flotante' : 'Congelado en Divisas'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                    <div>
                      <div className="text-slate-400">Monto Inicial</div>
                      <div className="font-bold text-slate-800">
                        {debt.currency === 'VES' ? 'Bs.' : '$'} {debt.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Saldo Pendiente</div>
                      <div className="font-extrabold text-sky-950">
                        {debt.currency === 'VES' ? 'Bs.' : debt.currency === 'EUR' ? '€' : '$'}{' '}
                        {calc ? calc.remainingAmountOriginal.toFixed(2) : '...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {paymentDebtId === debt.id ? (
                      <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full bg-white p-2 rounded-xl border border-sky-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="Monto abono"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-slate-300 rounded-lg focus:outline-hidden"
                        />
                        <select
                          value={paymentVaultId}
                          onChange={(e) => setPaymentVaultId(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-slate-300 rounded-lg focus:outline-hidden bg-slate-50"
                        >
                          <option value="">Bóveda (opcional)...</option>
                          {vaults.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.currency})
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
                            onClick={() => setPaymentDebtId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setPaymentDebtId(debt.id);
                            void loadPaymentsForDebt(debt.id);
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          + Registrar Abono
                        </button>

                        <button
                          onClick={() => {
                            void loadPaymentsForDebt(debt.id);
                            setSelectedDebtForReceipt(debt);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Comprobante Ticket
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
