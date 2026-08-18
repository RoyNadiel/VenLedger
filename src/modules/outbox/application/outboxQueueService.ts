import { db } from '../../shared/infrastructure/dexie/db';
import type { OutboxAction, OutboxEvent } from '../domain/entities';

export class OutboxQueueService {
  /**
   * Registra un nuevo evento de mutación en la cola Outbox.
   */
  async recordEvent(
    table: string,
    action: OutboxAction,
    payload: Record<string, unknown>
  ): Promise<OutboxEvent> {
    const event: OutboxEvent = {
      id: crypto.randomUUID(),
      table,
      action,
      payload,
      createdAt: new Date().toISOString(),
      synced: 0,
    };

    await db.outboxEvents.add(event);
    return event;
  }

  /**
   * Obtiene todos los eventos pendientes por sincronizar.
   */
  async getPendingEvents(): Promise<OutboxEvent[]> {
    return await db.outboxEvents
      .where('synced')
      .equals(0)
      .sortBy('createdAt');
  }

  /**
   * Marca un evento como sincronizado exitosamente con la nube.
   */
  async markAsSynced(eventId: string): Promise<void> {
    await db.outboxEvents.update(eventId, {
      synced: 1,
      syncedAt: new Date().toISOString(),
    });
  }

  /**
   * Registra un error de sincronización en el evento.
   */
  async markAsFailed(eventId: string, errorMessage: string): Promise<void> {
    await db.outboxEvents.update(eventId, {
      error: errorMessage,
    });
  }

  /**
   * Retorna la cantidad de eventos pendientes en cola.
   */
  async getPendingCount(): Promise<number> {
    return await db.outboxEvents.where('synced').equals(0).count();
  }

  /**
   * Elimina eventos antiguos que ya fueron sincronizados.
   */
  async clearSyncedEvents(): Promise<number> {
    const syncedEvents = await db.outboxEvents
      .where('synced')
      .equals(1)
      .toArray();
    const ids = syncedEvents.map((e) => e.id);
    await db.outboxEvents.bulkDelete(ids);
    return ids.length;
  }
}

export const outboxQueueService = new OutboxQueueService();
