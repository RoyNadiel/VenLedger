import { db } from './db';
import type { Vault } from '../../../vaults/domain/entities';
import type { Category } from '../../../categories/domain/entities';
import { seedRateHistoryIfNeeded } from '../../../rates/infrastructure/seedRateHistory';

const SEED_KEY = 'venledger_seeded_v2';

export async function seedInitialDataIfNeeded(): Promise<void> {
  // 1. Limpiar duplicados si existían por ejecuciones dobles en React StrictMode
  await cleanupDuplicateVaults();

  // 2. Sembrar historial de tasas desde CSV si aplica
  await seedRateHistoryIfNeeded();

  if (!localStorage.getItem(SEED_KEY)) {
    localStorage.setItem(SEED_KEY, 'true');

    // Actualizar o sembrar las 3 bóvedas por defecto
    const initialVaults: Vault[] = [
      {
        id: 'vault-bank-bdv',
        name: 'Banco Nacional (BDV)',
        type: 'bank',
        currency: 'VES',
        balance: 0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'vault-binance-usdt',
        name: 'Binance P2P',
        type: 'binance',
        currency: 'USDT',
        balance: 0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'vault-cash-usdt',
        name: 'Efectivo',
        type: 'cash',
        currency: 'USDT',
        balance: 0,
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.vaults.bulkPut(initialVaults);
  }

  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const initialCategories: Category[] = [
      { id: 'cat-food', name: 'Comida y Mercadería', color: '#f87171', type: 'expense' },
      { id: 'cat-services', name: 'Servicios Básicos', color: '#60a5fa', type: 'expense' },
      { id: 'cat-debts', name: 'Préstamos / Deudas', color: '#fbbf24', type: 'expense' },
      { id: 'cat-savings', name: 'Ahorro / Inversión', color: '#34d399', type: 'income' },
      { id: 'cat-salary', name: 'Sueldo / Freelance', color: '#a78bfa', type: 'income' },
    ];

    await db.categories.bulkPut(initialCategories);
  }
}

async function cleanupDuplicateVaults(): Promise<void> {
  const allVaults = await db.vaults.toArray();
  const seenTypes = new Set<string>();
  const duplicateIdsToDelete: string[] = [];

  for (const vault of allVaults) {
    if (seenTypes.has(vault.type)) {
      duplicateIdsToDelete.push(vault.id);
    } else {
      seenTypes.add(vault.type);
    }
  }

  if (duplicateIdsToDelete.length > 0) {
    await db.vaults.bulkDelete(duplicateIdsToDelete);
  }
}
