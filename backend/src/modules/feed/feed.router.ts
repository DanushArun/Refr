import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import { EventsService } from '../../shared/events/events.service.js';
import { behaviorEventSchema } from '@refr/shared';
import { FeedService } from './feed.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';

export const feedRouter = Router();

// GET /api/v1/feed?cursor=xxx&limit=20
// Returns the ranked, personalised feed for the authenticated user.
const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

feedRouter.get(
  '/',
  requireAuth,
  validate(feedQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const query = req.query as unknown as z.infer<typeof feedQuerySchema>;

      const feedResponse = await FeedService.getFeed({
        userId,
        cursor: query.cursor,
        limit: query.limit,
      });

      res.json({
        data: feedResponse.cards,
        meta: {
          cursor: feedResponse.cursor,
          hasMore: feedResponse.hasMore,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/feed/events
// Ingest a single behavior event from the client.
// Fire-and-forget: the client does not need to wait for this to complete.
feedRouter.post(
  '/events',
  requireAuth,
  validate(behaviorEventSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const body = req.body as z.infer<typeof behaviorEventSchema>;

      // Intentionally not awaited — analytics must not block the response
      void EventsService.logEvent({
        userId,
        eventType: body.eventType,
        cardId: body.cardId,
        cardType: body.cardType,
        positionInFeed: body.positionInFeed,
        durationMs: body.durationMs,
        action: body.action,
        timestamp: new Date(body.timestamp),
      });

      res.status(202).json({ data: { received: true } });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/feed/events/batch
// Ingest multiple events at once — reduces mobile battery/network usage.
const batchSchema = z.object({
  events: z.array(behaviorEventSchema).min(1).max(50),
});

feedRouter.post(
  '/events/batch',
  requireAuth,
  validate(batchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { events } = req.body as z.infer<typeof batchSchema>;

      void EventsService.logEventBatch(
        events.map((e) => ({
          userId,
          eventType: e.eventType,
          cardId: e.cardId,
          cardType: e.cardType,
          positionInFeed: e.positionInFeed,
          durationMs: e.durationMs,
          action: e.action,
          timestamp: new Date(e.timestamp),
        })),
      );

      res.status(202).json({ data: { received: events.length } });
    } catch (err) {
      next(err);
    }
  },
);
