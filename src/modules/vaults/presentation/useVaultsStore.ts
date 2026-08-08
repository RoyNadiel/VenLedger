import { create } from 'zustand';
import type { Vault } from '../domain/entities';
import { dexieVaultRepository } from '../infrastructure/dexieVaultRepository';

interface VaultsState {
  vaults: Vault[];
  isLoading: boolean;
  loadVaults: () => Promise<void>;
  createVault: (vaultData: Omit<Vault, 'id' | 'updatedAt'>) => Promise<Vault>;
  updateVault: (id: string, updates: Partial<Omit<Vault, 'id'>>) => Promise<Vault>;
  deleteVault: (id: string) => Promise<void>;
}

export const useVaultsStore = create<VaultsState>((set, get) => ({
  vaults: [],
  isLoading: false,
  loadVaults: async () => {
    set({ isLoading: true });
    const vaults = await dexieVaultRepository.getAll();
    set({ vaults, isLoading: false });
  },
  createVault: async (vaultData) => {
    const newVault = await dexieVaultRepository.create(vaultData);
    await get().loadVaults();
    return newVault;
  },
  updateVault: async (id, updates) => {
    const updatedVault = await dexieVaultRepository.update(id, updates);
    await get().loadVaults();
    return updatedVault;
  },
  deleteVault: async (id) => {
    await dexieVaultRepository.delete(id);
    await get().loadVaults();
  },
}));
