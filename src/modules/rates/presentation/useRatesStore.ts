import { create } from 'zustand';
import type { ExchangeRates } from '../../shared/domain/types';
import { ratesService } from '../application/ratesService';

interface RatesState {
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
}

export const useRatesStore = create<RatesState>((set) => ({
  rates: null,
  isLoading: false,
  error: null,
  fetchRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const rates = await ratesService.getRates();
      set({ rates, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al obtener tasas',
        isLoading: false,
      });
    }
  },
}));
