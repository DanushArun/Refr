import { z } from 'zod';

export const createCompanyIntelSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(10).max(150),
  body: z.string().min(50).max(2000),
  tags: z.array(z.string()).min(1).max(5),
});

export const feedRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const behaviorEventSchema = z.object({
  eventType: z.enum([
    'card_viewed',
    'card_time_spent',
    'card_action',
    'feed_session_start',
    'feed_session_end',
  ]),
  cardId: z.string().uuid(),
  cardType: z.string(),
  positionInFeed: z.number().int().min(0),
  durationMs: z.number().int().min(0).optional(),
  action: z.string().optional(),
  timestamp: z.string().datetime(),
});

export const createReferralRequestSchema = z.object({
  companyId: z.union([z.string(), z.number()]),
  jobId: z.union([z.string(), z.number()]).optional(),
  targetRole: z.string().min(1).max(100),
  source: z.enum(['specific', 'browse']),
  seekerNote: z.string().max(280).optional(),
});

export type CreateCompanyIntel = z.infer<typeof createCompanyIntelSchema>;
export type FeedRequestParams = z.infer<typeof feedRequestSchema>;
export type BehaviorEventInput = z.infer<typeof behaviorEventSchema>;
export type CreateReferralRequest = z.infer<typeof createReferralRequestSchema>;
