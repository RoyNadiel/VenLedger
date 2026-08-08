import { db } from '../../shared/infrastructure/dexie/db';
import type { Vault } from '../domain/entities';
import { outboxQueueService } from '../../outbox/application/outboxQueueService';

export class DexieVaultRepository {
  async getAll(): Promise<Vault[]> {
    return await db.vaults.toArray();
  }

  async getById(id: string): Promise<Vault | undefined> {
    return await db.vaults.get(id);
  }

  async create(vaultData: Omit<Vault, 'id' | 'updatedAt'>): Promise<Vault> {
    const vault: Vault = {
      ...vaultData,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };

    await db.vaults.add(vault);
    await outboxQueueService.recordEvent('vaults', 'INSERT', vault as unknown as Record<string, unknown>);
    return vault;
  }

  async update(id: string, updates: Partial<Omit<Vault, 'id'>>): Promise<Vault> {
    const existing = await db.vaults.get(id);
    if (!existing) {
      throw new Error(`Vault con id ${id} no encontrada`);
    }

    const updatedVault: Vault = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.vaults.put(updatedVault);
    await outboxQueueService.recordEvent('vaults', 'UPDATE', updatedVault as unknown as Record<string, unknown>);
    return updatedVault;
  }

  async delete(id: string): Promise<void> {
    await db.vaults.delete(id);
    await outboxQueueService.recordEvent('vaults', 'DELETE', { id });
  }
}

export const dexieVaultRepository = new DexieVaultRepository();
