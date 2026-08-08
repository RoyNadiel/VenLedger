export interface Category {
  id: string; // UUID v4
  userId?: string;
  name: string;
  color: string;
  icon?: string;
  type: 'income' | 'expense';
}
