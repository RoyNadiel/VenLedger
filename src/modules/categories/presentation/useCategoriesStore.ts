import { create } from 'zustand';
import type { Category } from '../domain/entities';
import { db } from '../../shared/infrastructure/dexie/db';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  loadCategories: async () => {
    set({ isLoading: true });
    const categories = await db.categories.toArray();
    set({ categories, isLoading: false });
  },
}));
