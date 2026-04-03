import { prisma } from '../../lib/prisma.js';
import { logger } from '../middleware/logger.js';
import type { BehaviorEventRecord } from './events.types.js';

// EventsService writes raw behavior events to the behavior_events table.
//
// Design notes:
// - Writes are fire-and-forget from the caller's perspective (non-blocking).
//   Route handlers call logEvent() and do NOT await it — the event batch is
//   inserted asynchronously so the API response is not delayed.
// - In Phase 3, replace the direct Prisma insert with a BullMQ job that
//   buffers events and bulk-inserts every 5 seconds to reduce DB write pressure.
// - The behavior_events table should be partitioned by month on timestamp.

export const EventsService = {
  /**
   * Persist a single behavior event.  Swallows errors to avoid disrupting the
   * request lifecycle — analytics must never cause a user-visible failure.
   */
  async logEvent(event: BehaviorEventRecord): Promise<void> {
    try {
      await prisma.behaviorEvent.create({
        data: {
          userId: event.userId,
          eventType: event.eventType,
          cardId: event.cardId ?? null,
          cardType: event.cardType ?? null,
          positionInFeed: event.positionInFeed ?? null,
          durationMs: event.durationMs ?? null,
          action: event.action ?? null,
          payload: event.payload ?? undefined,
          timestamp: event.timestamp,
        },
      });
    } catch (err) {
      // Log but do not rethrow — event loss is acceptable; API failure is not
      logger.warn({ err, event }, 'Failed to write behavior event');
    }
  },

  /**
   * Batch-insert multiple events in a single transaction.
   * Used by the POST /events/batch endpoint to reduce round-trips from mobile.
   */
  async logEventBatch(events: BehaviorEventRecord[]): Promise<void> {
    if (events.length === 0) return;
    try {
      await prisma.behaviorEvent.createMany({
        data: events.map((e) => ({
          userId: e.userId,
          eventType: e.eventType,
          cardId: e.cardId ?? null,
          cardType: e.cardType ?? null,
          positionInFeed: e.positionInFeed ?? null,
          durationMs: e.durationMs ?? null,
          action: e.action ?? null,
          payload: e.payload ?? undefined,
          timestamp: e.timestamp,
        })),
        skipDuplicates: true,
      });
    } catch (err) {
      logger.warn({ err, count: events.length }, 'Failed to write behavior event batch');
    }
  },
};
