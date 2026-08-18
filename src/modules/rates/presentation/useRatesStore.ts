import { create } from 'zustand';
import type { ExchangeRates } from '../../shared/domain/types';
import { ratesService } from '../application/ratesService';

interface RatesState {
  rates: ExchangeRates | null;
  rateTimestamp: string | null;
  fetchedAt: string | null;
  isLoading: boolean;
  error: string | null;
  fetchRates: (forceRefresh?: boolean) => Promise<void>;
}

export const useRatesStore = create<RatesState>((set) => ({
  rates: null,
  rateTimestamp: null,
  fetchedAt: null,
  isLoading: false,
  error: null,
  fetchRates: async (forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const rates = await ratesService.getRates(forceRefresh);
      const cachedRecord = await ratesService.getCachedRecord();

      set({
        rates,
        rateTimestamp: cachedRecord?.rateTimestamp || rates?.timestamp || null,
        fetchedAt: cachedRecord?.fetchedAt || null,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al obtener tasas',
        isLoading: false,
      });
    }
  },
}));
