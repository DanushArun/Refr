import type { BehaviorEventType } from '@refr/shared';

// The full payload written to the behavior_events table.
// This mirrors the BehaviorEvent shape from @refr/shared but adds server-side
// fields (userId resolved from JWT, server-stamped receivedAt).
export interface BehaviorEventRecord {
  userId: string;
  eventType: BehaviorEventType;
  cardId?: string;
  cardType?: string;
  positionInFeed?: number;
  durationMs?: number;
  action?: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}
