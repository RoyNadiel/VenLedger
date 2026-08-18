import { db, type RateHistoryRecord } from '../../shared/infrastructure/dexie/db';
import rawCsv from '../../../../rates_rows.csv?raw';

export async function seedRateHistoryIfNeeded(): Promise<void> {
  const existingCount = await db.rateHistory.count();
  // Se siembra si la tabla de historial está vacía o tiene muy pocos registros
  if (existingCount > 10) return;

  try {
    const lines = rawCsv.split(/\r?\n/);
    if (lines.length <= 1) return;

    const records: RateHistoryRecord[] = [];

    // Formato CSV: id,usd_official,eur_official,usd_libre,source,timestamp
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length < 6) continue;

      const usd_official = parseFloat(cols[1]);
      const eur_official = parseFloat(cols[2]);
      const usd_libre = parseFloat(cols[3]);
      const rawTimestamp = cols[5]?.trim();

      if (!rawTimestamp || isNaN(usd_official)) continue;

      const dateKey = rawTimestamp.split(' ')[0] || rawTimestamp.split('T')[0];
      if (!dateKey) continue;

      records.push({
        date: dateKey,
        usd_official,
        eur_official,
        usd_libre,
        timestamp: rawTimestamp,
      });
    }

    if (records.length > 0) {
      await db.rateHistory.bulkPut(records);
    }
  } catch (err) {
    console.warn('Error sembrando historial de tasas desde CSV:', err);
  }
}
