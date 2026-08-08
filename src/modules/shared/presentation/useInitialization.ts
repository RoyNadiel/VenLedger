import { useEffect, useState } from 'react';
import { seedInitialDataIfNeeded } from '../infrastructure/dexie/seed';
import { useVaultsStore } from '../../vaults/presentation/useVaultsStore';
import { useRatesStore } from '../../rates/presentation/useRatesStore';
import { useTransactionsStore } from '../../transactions/presentation/useTransactionsStore';
import { useDebtsStore } from '../../debts/presentation/useDebtsStore';
import { useOutboxStore } from '../../outbox/presentation/useOutboxStore';

export function useInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // 1. Sembrar datos iniciales si no existen (Bóvedas y Categorías)
        await seedInitialDataIfNeeded();

        // 2. Cargar estado en tiendas de Zustand en paralelo
        await Promise.all([
          useRatesStore.getState().fetchRates(),
          useVaultsStore.getState().loadVaults(),
          useTransactionsStore.getState().loadTransactions(),
          useDebtsStore.getState().loadDebts(),
          useOutboxStore.getState().refreshOutboxState(),
        ]);

        setIsInitialized(true);
      } catch (err) {
        console.error('Error inicializando datos en VenLedger:', err);
        setInitError(
          err instanceof Error ? err.message : 'Error desconocido al inicializar'
        );
      }
    }

    void init();
  }, []);

  return { isInitialized, initError };
}
