import React from 'react';
import { VaultsSummary } from '../../vaults/presentation/VaultsSummary';
import { TransactionsView } from '../../transactions/presentation/TransactionsView';
import { DebtsView } from '../../debts/presentation/DebtsView';
import { AnalyticsView } from './AnalyticsView';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Fila superior: Resumen de Bóvedas completo */}
      <VaultsSummary />

      {/* Fila principal en Grid Desktop (2 columnas de contenido principal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda (8 columnas): Movimientos y Registro */}
        <div className="lg:col-span-7 space-y-6">
          <TransactionsView />
        </div>

        {/* Columna Derecha (5 columnas): Deudas y Salud Financiera */}
        <div className="lg:col-span-5 space-y-6">
          <AnalyticsView />
          <DebtsView />
        </div>
      </div>
    </div>
  );
};
