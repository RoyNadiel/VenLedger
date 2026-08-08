import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Debt, DebtPayment } from '../domain/entities';
import type { ExchangeRates } from '../../shared/domain/types';
import { FinanceEngine } from '../../analytics/domain/financeEngine';

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
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `Comprobante_Abono_${debt.contactName.replace(/\s+/g, '_')}.png`;
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
    const message = encodeURIComponent(
      `🧾 *Comprobante de Abono - VenLedger*\n` +
      `👤 *Contacto:* ${debt.contactName}\n` +
      `💰 *Monto Original:* ${debt.currency === 'VES' ? 'Bs.' : '$'} ${debt.totalAmount.toFixed(2)}\n` +
      `✅ *Total Abonado:* $ ${calc.totalPaidUSDT.toFixed(2)} (Bs. ${calc.totalPaidVES.toFixed(2)})\n` +
      `📌 *Saldo Pendiente:* $ ${calc.remainingAmountUSDT.toFixed(2)} (Bs. BCV: ${calc.remainingAmountVES_Official.toFixed(2)})\n` +
      `🗓 *Fecha:* ${new Date().toLocaleDateString()}\n` +
      `_Generado por VenLedger App_`
    );
    const phone = debt.contactPhone ? debt.contactPhone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-base font-bold text-slate-800">Comprobante de Abono</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
            ✕
          </button>
        </div>

        {/* Ticket visual que se exportará a imagen */}
        <div
          ref={receiptRef}
          className="bg-gradient-to-b from-sky-50 to-white border border-sky-200 p-5 rounded-2xl shadow-inner space-y-3 text-slate-800 font-sans"
        >
          <div className="text-center border-b border-sky-100 pb-2">
            <div className="text-xs font-bold uppercase text-sky-600 tracking-wider">VenLedger Ticket</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{debt.contactName}</div>
            <div className="text-[10px] text-slate-400">
              Acuerdo: {debt.agreementType === 'fixed_usdt' ? 'Congelado en USDT' : 'Flotante en Bs'}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Monto Original:</span>
              <span className="font-semibold">{debt.currency === 'VES' ? 'Bs.' : '$'} {debt.totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              <span>Total Abonado:</span>
              <span className="font-bold">$ {calc?.totalPaidUSDT.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-rose-700 bg-rose-50 px-2 py-1 rounded-lg">
              <span>Saldo Pendiente:</span>
              <span className="font-bold">$ {calc?.remainingAmountUSDT.toFixed(2)}</span>
            </div>

            {calc && (
              <div className="text-[10px] text-slate-400 text-center pt-1">
                Eq. Bs. BCV: {calc.remainingAmountVES_Official.toFixed(2)} Bs | P2P: {calc.remainingAmountVES_Libre.toFixed(2)} Bs
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-400 text-center border-t border-sky-100 pt-2">
            Emisión: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => void handleDownloadImage()}
            disabled={isGenerating}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>{isGenerating ? 'Generando PNG...' : 'Descargar Imagen Ticket'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Compartir por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
