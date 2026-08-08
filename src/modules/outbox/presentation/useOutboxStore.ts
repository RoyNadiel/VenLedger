import { create } from 'zustand';
import type { OutboxEvent } from '../domain/entities';
import { outboxQueueService } from '../application/outboxQueueService';

interface OutboxState {
  pendingCount: number;
  pendingEvents: OutboxEvent[];
  isLoading: boolean;
  refreshOutboxState: () => Promise<void>;
}

export const useOutboxStore = create<OutboxState>((set) => ({
  pendingCount: 0,
  pendingEvents: [],
  isLoading: false,
  refreshOutboxState: async () => {
    set({ isLoading: true });
    const count = await outboxQueueService.getPendingCount();
    const events = await outboxQueueService.getPendingEvents();
    set({ pendingCount: count, pendingEvents: events, isLoading: false });
  },
}));
