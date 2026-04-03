import type { FeedCard } from './content';

/** Paginated feed response from the API */
export interface FeedResponse {
  cards: FeedCard[];
  cursor: string | null;       // Null when no more pages
  hasMore: boolean;
}

/** Feed request parameters */
export interface FeedRequest {
  cursor?: string;             // Cursor for pagination (keyset-based)
  limit?: number;              // Cards per page (default: 20, max: 50)
}

/** Behavior event sent from client to track engagement */
export interface BehaviorEvent {
  eventType: BehaviorEventType;
  cardId: string;
  cardType: string;
  positionInFeed: number;
  durationMs?: number;         // For card_time_spent
  action?: string;             // For card_action: refer/save/react/skip
  timestamp: string;
}

export type BehaviorEventType =
  | 'card_viewed'
  | 'card_time_spent'
  | 'card_action'
  | 'feed_session_start'
  | 'feed_session_end';
