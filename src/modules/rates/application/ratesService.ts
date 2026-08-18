import { db } from '../../shared/infrastructure/dexie/db';
import type { ExchangeRates } from '../../shared/domain/types';
import { ratesApiClient } from '../infrastructure/ratesApiClient';
import {
  VesImpactEngine,
  type VesImpactPeriods,
} from '../domain/vesImpactEngine';

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
      const nowIso = new Date().toISOString();
      const officialTimestamp = freshRates.timestamp || nowIso;
      const dateKey = officialTimestamp.split('T')[0];

      // 1. Guardar en caché principal (separando fecha de consulta e indicador oficial de la tasa)
      await db.exchangeRatesCache.put({
        key: 'latest',
        rates: freshRates,
        fetchedAt: nowIso,
        rateTimestamp: officialTimestamp,
      });

      // 2. Guardar en tabla de historial diario
      if (dateKey && freshRates.usd_official > 0) {
        await db.rateHistory.put({
          date: dateKey,
          usd_official: freshRates.usd_official,
          eur_official: freshRates.eur_official,
          usd_libre: freshRates.usd_libre,
          timestamp: officialTimestamp,
        });
      }

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

  /**
   * Retorna la información extendida cacheada de las tasas (incluyendo rateTimestamp y fetchedAt).
   */
  async getCachedRecord() {
    return await db.exchangeRatesCache.get('latest');
  }

  /**
   * Obtiene la tasa oficial de hace N días (o la más cercana en el historial).
   */
  async getPastRate(daysAgo: number): Promise<number | null> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const targetKey = targetDate.toISOString().split('T')[0];

    const exactMatch = await db.rateHistory.get(targetKey);
    if (exactMatch && exactMatch.usd_official > 0) {
      return exactMatch.usd_official;
    }

    // Si no hay coincidencia exacta, busca la captura más cercana anterior a la fecha objetivo
    const allRecords = await db.rateHistory.toArray();
    if (allRecords.length === 0) return null;

    allRecords.sort((a, b) => a.date.localeCompare(b.date));
    const closest = allRecords.reverse().find((r) => r.date <= targetKey);
    return closest ? closest.usd_official : null;
  }

  /**
   * Calcula el impacto monetario (ganancia/pérdida) en USD y Bs para un monto en Bolívares.
   * Periodos: day1 (Ayer), days7 (7 días), days30 (30 días).
   */
  async getVesImpact(
    vesAmount: number,
    currentRate: number
  ): Promise<VesImpactPeriods> {
    if (!vesAmount || vesAmount <= 0 || !currentRate || currentRate <= 0) {
      return { day1: null, days7: null, days30: null };
    }

    const [rate1, rate7, rate30] = await Promise.all([
      this.getPastRate(1),
      this.getPastRate(7),
      this.getPastRate(30),
    ]);

    return {
      day1: rate1 ? VesImpactEngine.calculateImpact(vesAmount, currentRate, rate1) : null,
      days7: rate7 ? VesImpactEngine.calculateImpact(vesAmount, currentRate, rate7) : null,
      days30: rate30 ? VesImpactEngine.calculateImpact(vesAmount, currentRate, rate30) : null,
    };
  }
}

export const ratesService = new RatesService();
