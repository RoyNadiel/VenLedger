import { db } from '../../shared/infrastructure/dexie/db';
import type { ExchangeRates } from '../../shared/domain/types';
import { ratesApiClient } from '../infrastructure/ratesApiClient';

export class RatesService {
  /**
   * Obtiene las tasas cambiarias.
   * Si forceRefresh = false, reutiliza la caché de IndexedDB si la última consulta fue realizada el mismo día.
   * Si forceRefresh = true, consulta la API directamente.
   */
  async getRates(forceRefresh = false): Promise<ExchangeRates> {
    if (!forceRefresh) {
      const cached = await db.exchangeRatesCache.get('latest');
      if (cached && cached.fetchedAt) {
        const lastDate = new Date(cached.fetchedAt).toDateString();
        const todayDate = new Date().toDateString();
        const hasValidData =
          cached.rates &&
          cached.rates.usd_official !== 1 &&
          cached.rates.usd_official > 1;

        if (lastDate === todayDate && hasValidData) {
          return cached.rates;
        }
      }
    }

    try {
      const freshRates = await ratesApiClient.fetchLatestRates();
      await db.exchangeRatesCache.put({
        key: 'latest',
        rates: freshRates,
        fetchedAt: new Date().toISOString(),
      });
      return freshRates;
    } catch (error) {
      console.warn(
        'Error al obtener tasas online, intentando caché local:',
        error
      );
      const cached = await db.exchangeRatesCache.get('latest');
      if (cached) {
        return cached.rates;
      }
      // Fallback básico por defecto en caso de no tener nada cacheado
      return {
        usd_official: 1,
        eur_official: 1,
        usd_libre: 1,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const ratesService = new RatesService();
