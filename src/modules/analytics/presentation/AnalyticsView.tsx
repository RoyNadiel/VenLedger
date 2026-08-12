import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { FinanceEngine } from '../domain/financeEngine';

const PASTEL_COLORS = ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#f87171'];

export const AnalyticsView: React.FC = () => {
  const { transactions } = useTransactionsStore();
  const { vaults } = useVaultsStore();
  const { rates } = useRatesStore();

  // 1. Agrupar gastos por categoría/nota para el gráfico de pastel
  const expenses = transactions.filter((tx) => tx.type === 'expense');
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((tx) => {
    const key = tx.note || 'General';
    categoryTotals[key] = (categoryTotals[key] || 0) + tx.amount;
  });

  const pieData = Object.keys(categoryTotals).map((key) => ({
    name: key,
    value: categoryTotals[key],
  }));

  // 2. Medidor del poder de compra del USDT
  const consolidated = rates
    ? FinanceEngine.calculateConsolidatedBalance(vaults, rates)
    : { totalUSDT: 0 };

  const purchasingPower = rates
    ? FinanceEngine.calculatePurchasingPower(
        consolidated.totalUSDT,
        rates.usd_libre * 0.95, // Ejemplo de tasa histórica base para comparativa
        rates.usd_libre
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Termómetro de Poder de Compra del USDT */}
      {purchasingPower && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Termómetro de Poder de Compra</h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                purchasingPower.status === 'gained'
                  ? 'bg-emerald-100 text-emerald-800'
                  : purchasingPower.status === 'lost'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {purchasingPower.status === 'gained'
                ? ' Ganando capacidad'
                : purchasingPower.status === 'lost'
                ? ' Perdiendo capacidad'
                : ' Neutral'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Tus ahorros en USDT (${purchasingPower.usdtBalance.toFixed(2)}) equivalen hoy a{' '}
            <strong className="text-slate-800">Bs. {purchasingPower.currentValueInVES.toLocaleString()}</strong> en el mercado P2P.
          </p>

          <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                purchasingPower.percentageChange >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, Math.abs(purchasingPower.percentageChange) * 5))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Gráfico de Distribución de Gastos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Distribución de Gastos por Categoría</h2>
        {pieData.length === 0 ? (
          <div className="text-xs text-slate-400 italic text-center py-8">
            No hay gastos suficientes para generar el gráfico.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${(Number(value) || 0).toFixed(2)}`, 'Monto']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
