import { db } from '../../shared/infrastructure/dexie/db';
import { INITIAL_RATE_HISTORY } from './initialRateHistory';

export async function seedRateHistoryIfNeeded(): Promise<void> {
  const existingCount = await db.rateHistory.count();
  // Se siembra si la tabla de historial está vacía o tiene muy pocos registros
  if (existingCount > 10) return;

  try {
    if (INITIAL_RATE_HISTORY.length > 0) {
      await db.rateHistory.bulkPut(INITIAL_RATE_HISTORY);
    }
  } catch (err) {
    console.warn('Error sembrando historial de tasas:', err);
  }
}
