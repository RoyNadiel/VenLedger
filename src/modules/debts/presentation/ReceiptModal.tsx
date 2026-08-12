import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Debt, DebtPayment } from '../domain/entities';
import type { ExchangeRates } from '../../shared/domain/types';
import { FinanceEngine } from '../../analytics/domain/financeEngine';
import { getCurrencySymbol } from '../../shared/domain/currencyUtils';

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

  const calc = rates
    ? FinanceEngine.calculateDebtBalance(debt, payments, rates)
    : null;

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
      `✅ *Total Abonado:* $ ${calc.totalPaidUSDT.toFixed(2)}\n` +
      `   _(Bs. ${calc.totalPaidVES.toFixed(2)})_\n` +
      `📌 *Saldo Pendiente:* $ ${calc.remainingAmountUSDT.toFixed(2)}\n` +
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

  const isPaid = calc && calc.remainingAmountUSDT <= 0;

  // Accent color based on type
  const accentColor = isReceivable ? '#0369a1' : '#b91c1c';
  const accentLight = isReceivable ? '#e0f2fe' : '#fee2e2';
  const accentText = isReceivable ? '#0c4a6e' : '#7f1d1d';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal shell — wider ticket */}
      <div
        className="w-full relative"
        style={{ maxWidth: '420px', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.35))' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
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
            borderRadius: '20px',
            overflow: 'hidden',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: accentColor,
            padding: '24px 28px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative arc */}
            <div style={{
              position: 'absolute', bottom: '-40px', right: '-40px',
              width: '120px', height: '120px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: '-20px', right: '20px',
              width: '70px', height: '70px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
            }} />

            {/* Brand label */}
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: '8px',
            }}>
              VenLedger · Comprobante de Abono
            </div>

            {/* Contact name */}
            <div style={{
              fontSize: '26px', fontWeight: 900, color: '#ffffff',
              letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '12px',
            }}>
              {debt.contactName}
            </div>

            {/* Pills row */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Type badge */}
              <div style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '999px', padding: '4px 12px',
                fontSize: '11px', fontWeight: 700, color: '#ffffff',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {isReceivable ? '⬆ Por Cobrar' : '⬇ Por Pagar'}
              </div>

              {/* Agreement badge */}
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '999px', padding: '4px 12px',
                fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
              }}>
                {agreementLabel}
              </div>

              {debt.contactPhone && (
                <div style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '999px', padding: '4px 12px',
                  fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                }}>
                  📱 {debt.contactPhone}
                </div>
              )}
            </div>
          </div>

          {/* ── Data section ── */}
          <div style={{ padding: '22px 28px', background: '#ffffff' }}>

            {/* Monto original */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '16px', borderBottom: '1px solid #e2e8f0',
              marginBottom: '16px',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Monto Original
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Moneda base: {debt.currency}
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                {sym} {debt.totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Total Abonado */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '12px',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  ✅ Total Abonado
                </div>
                {calc && (
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
                    Bs. {calc.totalPaidVES.toFixed(2)}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '22px', fontWeight: 900, color: '#15803d',
              }}>
                $ {calc?.totalPaidUSDT.toFixed(2) ?? '—'}
              </div>
            </div>

            {/* Saldo Pendiente */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: isPaid ? '#f0fdf4' : '#fff7ed',
              border: `1px solid ${isPaid ? '#bbf7d0' : '#fed7aa'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '12px',
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isPaid ? '#15803d' : '#c2410c', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {isPaid ? '✅ Saldo' : '⏳ Saldo Pendiente'}
                </div>
                {calc && (
                  <div style={{ fontSize: '12px', color: isPaid ? '#166534' : '#9a3412', fontWeight: 500 }}>
                    BCV Bs. {calc.remainingAmountVES_Official.toFixed(2)}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '22px', fontWeight: 900,
                color: isPaid ? '#15803d' : '#c2410c',
              }}>
                $ {calc?.remainingAmountUSDT.toFixed(2) ?? '—'}
              </div>
            </div>

            {/* P2P Equiv row */}
            {calc && (
              <div style={{
                background: accentLight,
                borderRadius: '10px', padding: '10px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: accentText }}>
                  Equivalente P2P (Bs.)
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: accentText }}>
                  {calc.remainingAmountVES_Libre.toFixed(2)} Bs.
                </span>
              </div>
            )}
          </div>

          {/* ── Dashed tear line ── */}
          <div style={{
            position: 'relative', margin: '0 28px',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              position: 'absolute', left: '-32px', width: '16px', height: '16px',
              background: '#f8fafc', borderRadius: '50%',
              border: '1px solid #e2e8f0',
            }} />
            <div style={{ flex: 1, borderTop: '2px dashed #cbd5e1' }} />
            <div style={{
              position: 'absolute', right: '-32px', width: '16px', height: '16px',
              background: '#f8fafc', borderRadius: '50%',
              border: '1px solid #e2e8f0',
            }} />
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '14px 28px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#ffffff',
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              📅 {new Date().toLocaleString('es-VE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em',
              color: accentColor, textTransform: 'uppercase',
            }}>
              VenLedger
            </div>
          </div>
        </div>

        {/* ── Action buttons (outside the PNG area) ── */}
        <div className="flex flex-col gap-2.5 mt-3">
          <button
            onClick={() => void handleDownloadImage()}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, #6366f1 100%)`,
              border: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {isGenerating ? '⏳ Generando...' : '⬇ Descargar PNG'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5"
            style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#bbf7d0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#dcfce7')}
          >
            💬 Compartir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
