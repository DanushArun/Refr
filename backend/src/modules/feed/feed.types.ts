import type { FeedCard, UserRole } from '@refr/shared';

// Context passed to the ranking function for each candidate card
export interface RankingContext {
  viewerRole: UserRole;
  // Viewer's target companies (for seekers) or the company they work at (for referrers)
  viewerCompanyIds: string[];
  // Skills the viewer cares about (seeker skills or referrer canReferTo)
  viewerSkills: string[];
  // Current epoch time — used to compute recency decay
  nowMs: number;
}

// A candidate card before its final score is applied
export interface ScoredCard {
  card: FeedCard;
  rawScore: number;
  recencyComponent: number;
  relevanceComponent: number;
  popularityComponent: number;
}

// Cursor for keyset-based pagination.
// Encoded as base64(JSON) to be opaque to the client.
export interface FeedCursor {
  score: number;
  createdAt: string; // ISO-8601
  id: string;
}
