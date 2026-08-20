import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Debt, DebtPayment } from '../domain/entities';
import type { ExchangeRates } from '../../shared/domain/types';
import { FinanceEngine } from '../../analytics/domain/financeEngine';
import { getCurrencySymbol, getRateInVES } from '../../shared/domain/currencyUtils';

interface ReceiptModalProps {
  debt: Debt;
  payments: DebtPayment[];
  rates: ExchangeRates | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  debt,
  payments,
  rates,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fallbackRates: ExchangeRates = rates || {
    usd_official: 1,
    eur_official: 1,
    usd_libre: 1,
    timestamp: new Date().toISOString(),
  };

  const calc = FinanceEngine.calculateDebtBalance(debt, payments, fallbackRates);
  const debtRateInVES = getRateInVES(debt.currency, fallbackRates);

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Comprobante_${debt.contactName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generando comprobante:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!calc) return;
    const sym = getCurrencySymbol(debt.currency);
    const message = encodeURIComponent(
      `🧾 *Comprobante de Abono — VenLedger*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Contacto:* ${debt.contactName}\n` +
      `💰 *Monto Original:* ${sym} ${debt.totalAmount.toFixed(2)}\n` +
      `✅ *Total Abonado:* ${sym} ${calc.totalPaidOriginal.toFixed(2)}\n` +
      `   _(Bs. ${calc.totalPaidVES.toFixed(2)})_\n` +
      `📌 *Saldo Pendiente:* ${sym} ${calc.remainingAmountOriginal.toFixed(2)}\n` +
      `   _(Bs. BCV ${calc.remainingAmountVES_Official.toFixed(2)} | P2P ${calc.remainingAmountVES_Libre.toFixed(2)})_\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `_Generado con VenLedger_`
    );
    const phone = debt.contactPhone ? debt.contactPhone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const sym = getCurrencySymbol(debt.currency);
  const agreementLabel =
    debt.agreementType === 'floating_ves' ? 'Flotante en Bs.' : 'Congelado en Divisas';
  const isReceivable = debt.type === 'receivable';

  const isPaid = calc.remainingAmountOriginal <= 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in"
      style={{ background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal shell */}
      <div
        className="w-full relative"
        style={{ maxWidth: '400px' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors bg-zinc-900 text-zinc-100 border border-zinc-700 hover:bg-zinc-800"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Ticket body (exported to PNG) ── */}
        <div
          ref={receiptRef}
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            fontFamily: '"Bellota", "Segoe UI", system-ui, sans-serif',
            border: '1px solid #e4e4e7',
            color: '#18181b',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: '#18181b',
            color: '#ffffff',
            padding: '20px 24px 16px',
            position: 'relative',
          }}>
            {/* Brand label */}
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
              color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '6px',
              fontFamily: '"Inconsolata", monospace',
            }}>
              VenLedger · Comprobante de Abono
            </div>

            {/* Contact name */}
            <div style={{
              fontSize: '22px', fontWeight: 700, color: '#ffffff',
              letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '10px',
              fontFamily: '"Bellota", sans-serif',
            }}>
              {debt.contactName}
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '4px', padding: '3px 8px',
                fontSize: '10px', fontWeight: 700, color: '#f4f4f5',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                fontFamily: '"Inconsolata", monospace',
              }}>
                {isReceivable ? 'Por Cobrar' : 'Por Pagar'}
              </div>

              <div style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '4px', padding: '3px 8px',
                fontSize: '10px', fontWeight: 600, color: '#d4d4d8',
                fontFamily: '"Inconsolata", monospace',
              }}>
                {agreementLabel}
              </div>

              {debt.contactPhone && (
                <div style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '4px', padding: '3px 8px',
                  fontSize: '10px', fontWeight: 600, color: '#d4d4d8',
                  fontFamily: '"Inconsolata", monospace',
                }}>
                  {debt.contactPhone}
                </div>
              )}
            </div>
          </div>

          {/* ── Data section ── */}
          <div style={{ padding: '20px 24px', background: '#ffffff' }}>

            {/* Monto original */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '12px', borderBottom: '1px solid #f4f4f5',
              marginBottom: '12px',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px', fontFamily: '"Inconsolata", monospace' }}>
                  Monto Original
                </div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: '"Inconsolata", monospace' }}>
                  Moneda: {debt.currency}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#18181b', fontFamily: '"Inconsolata", monospace' }}>
                {sym} {debt.totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Total Abonado */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f4f4f5',
              border: '1px solid #e4e4e7',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '10px',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px', fontFamily: '"Inconsolata", monospace' }}>
                  ✓ Total Abonado
                </div>
                <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600, fontFamily: '"Inconsolata", monospace' }}>
                  Bs. {calc.totalPaidVES.toFixed(2)}
                </div>
              </div>
              <div style={{
                fontSize: '20px', fontWeight: 700, color: '#16a34a', fontFamily: '"Inconsolata", monospace',
              }}>
                {sym} {calc.totalPaidOriginal.toFixed(2)}
              </div>
            </div>

            {/* Saldo Pendiente */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: isPaid ? '#f4f4f5' : '#fafafa',
              border: `1px solid ${isPaid ? '#e4e4e7' : '#e4e4e7'}`,
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '10px',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: isPaid ? '#16a34a' : '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px', fontFamily: '"Inconsolata", monospace' }}>
                  {isPaid ? '✓ Saldo Saldado' : '⏳ Saldo Pendiente'}
                </div>
                <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600, fontFamily: '"Inconsolata", monospace' }}>
                  BCV Bs. {calc.remainingAmountVES_Official.toFixed(2)}
                </div>
              </div>
              <div style={{
                fontSize: '20px', fontWeight: 700,
                color: isPaid ? '#16a34a' : '#dc2626',
                fontFamily: '"Inconsolata", monospace',
              }}>
                {sym} {calc.remainingAmountOriginal.toFixed(2)}
              </div>
            </div>

            {/* P2P Equiv row */}
            <div style={{
              background: '#f4f4f5',
              borderRadius: '6px', padding: '8px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid #e4e4e7',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', fontFamily: '"Inconsolata", monospace' }}>
                Eq. P2P (Bs.)
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#18181b', fontFamily: '"Inconsolata", monospace' }}>
                Bs. {calc.remainingAmountVES_Libre.toFixed(2)}
              </span>
            </div>

            {/* Desglose de Abonos Individuales */}
            {payments.length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e4e4e7' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontFamily: '"Inconsolata", monospace' }}>
                  Historial de Abonos ({payments.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {payments.map((p) => {
                    const pRate = getRateInVES(p.currency, fallbackRates, p.rateUsed);
                    const pVES = p.amount * pRate;
                    const pCredited = debtRateInVES > 0 ? pVES / debtRateInVES : p.amount;
                    const pSym = getCurrencySymbol(p.currency);
                    return (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: '"Inconsolata", monospace' }}>
                        <span style={{ color: '#71717a' }}>
                          {new Date(p.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' })} · {pSym} {p.amount.toFixed(2)} ({p.currency})
                        </span>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>
                          - {sym} {pCredited.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Dashed tear line ── */}
          <div style={{
            position: 'relative', margin: '0 24px',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{ flex: 1, borderTop: '1px dashed #e4e4e7' }} />
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '12px 24px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#ffffff',
          }}>
            <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 600, fontFamily: '"Inconsolata", monospace' }}>
              {new Date().toLocaleString('es-VE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
              color: '#18181b', textTransform: 'uppercase', fontFamily: '"Inconsolata", monospace',
            }}>
              VENLEDGER
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={() => void handleDownloadImage()}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-md font-title-bold text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-60"
          >
            {isGenerating ? 'Generando...' : 'Descargar PNG'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 rounded-md font-title-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
          >
            Compartir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
