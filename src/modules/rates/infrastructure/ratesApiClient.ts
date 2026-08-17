import type { ExchangeRates } from '../../shared/domain/types';

const RATES_ENDPOINT =
  'https://tasa-actual-api-worker.roynadiel.workers.dev/api/v1/bcv';

export class RatesApiClient {
  async fetchLatestRates(): Promise<ExchangeRates> {
    const response = await fetch(RATES_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Error consultando API de tasas: ${response.statusText}`);
    }
    const data = (await response.json()) as ExchangeRates;
    return {
      usd_official: Number(data.usd_official),
      eur_official: Number(data.eur_official),
      usd_libre: Number(data.usd_libre),
      timestamp: data.timestamp || new Date().toISOString(),
    };
  }
}

export const ratesApiClient = new RatesApiClient();
