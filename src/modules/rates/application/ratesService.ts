import { db } from '../../shared/infrastructure/dexie/db';
import type { ExchangeRates } from '../../shared/domain/types';
import { ratesApiClient } from '../infrastructure/ratesApiClient';

export class RatesService {
  /**
   * Obtiene las tasas cambiarias más recientes (intenta API, de lo contrario devuelve las cacheadas).
   */
  async getRates(): Promise<ExchangeRates> {
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
