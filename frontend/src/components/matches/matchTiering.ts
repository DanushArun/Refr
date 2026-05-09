import type { ReferralStatus, SeekerPipelineItem } from '@refr/shared';
import { latestStageTimestamp } from '../activity/referralCardShared';

/**
 * Three-tier inbox classification for the seeker's Matches screen.
 *
 *   fresh   — just-accepted, conversation hasn't started yet. Drives the
 *             social action: "go say hi." Lives in a horizontal carousel.
 *   active  — ongoing relationship. Daily-scan WhatsApp-style rows.
 *   resting — terminal outcome OR no activity in 30+ days. Hidden behind a
 *             collapsed header so the active surface stays clean. Data is
 *             preserved (we never delete user history) but de-emphasised.
 *
 * Today's heuristics rely only on what the API already returns
 * (`status`, `acceptedAt`, `submittedAt`, `outcomeAt`, `requestedAt`). When
 * the backend exposes `lastMessageAt` / `unreadCount` per match, the rules
 * upgrade in one place and the screen layout stays unchanged.
 */

export type MatchTier = 'fresh' | 'active' | 'resting';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const TERMINAL: ReadonlySet<ReferralStatus> = new Set([
  'hired',
  'rejected',
  'withdrawn',
  'expired',
]);

/** Newly-accepted window — within this many hours of acceptance, the match
 *  belongs in the fresh carousel. After it, it graduates to active so the
 *  carousel doesn't accumulate stale items.
 *
 *  Tight window because today we have no chat metadata to check whether a
 *  conversation has actually started — `acceptedAt` is the only signal.
 *  6 hours roughly means "you were just matched and probably haven't
 *  messaged yet"; anything older we assume the chat is live and move it
 *  into Conversations. Once the API exposes `lastMessageAt` per match, this
 *  heuristic becomes "no messages exchanged yet" and the window goes away. */
const FRESH_WINDOW_HOURS = 6;

/** Inactivity window — if a referral has had no stage advance in this many
 *  days, treat it as resting. */
const RESTING_INACTIVITY_DAYS = 30;

function hoursSince(iso?: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / HOUR;
}

function daysSince(iso?: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / DAY;
}

export function classifyMatch(item: SeekerPipelineItem): MatchTier {
  const r = item.referral;
  if (TERMINAL.has(r.status)) return 'resting';

  // Fresh = recently accepted, conversation still presumed cold.
  if (r.status === 'accepted' && hoursSince(r.acceptedAt) < FRESH_WINDOW_HOURS) {
    return 'fresh';
  }

  // Resting by inactivity — most-recent event older than threshold.
  const latest = latestStageTimestamp(r);
  if (daysSince(latest) > RESTING_INACTIVITY_DAYS) return 'resting';

  return 'active';
}

export interface TieredMatches {
  fresh: SeekerPipelineItem[];
  active: SeekerPipelineItem[];
  resting: SeekerPipelineItem[];
}

/** Partition the full match list into the three tiers and pre-sort each tier
 *  by its most-relevant timestamp (most-recent first). */
export function partitionMatches(items: SeekerPipelineItem[]): TieredMatches {
  const out: TieredMatches = { fresh: [], active: [], resting: [] };
  for (const it of items) out[classifyMatch(it)].push(it);

  const byRecency = (a: SeekerPipelineItem, b: SeekerPipelineItem): number => {
    const ta = new Date(latestStageTimestamp(a.referral) ?? 0).getTime();
    const tb = new Date(latestStageTimestamp(b.referral) ?? 0).getTime();
    return tb - ta;
  };
  out.fresh.sort(byRecency);
  out.active.sort(byRecency);
  out.resting.sort(byRecency);
  return out;
}

/**
 * Relative-time short labels: "now", "2m", "3h", "Yesterday", "5d", "3w",
 * "Mar 4". Matches the convention every chat app uses; lands quick on a
 * sub-100ms scan.
 */
export function relativeLabel(iso?: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  if (days < 28) return `${Math.floor(days / 7)}w`;
  // Older than a month — give a date so the user can place it.
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
