import type { ReferralStatus, SeekerPipelineItem } from '@refr/shared';
import { latestStageTimestamp } from '../activity/referralCardShared';

/**
 * Inbox classification for the seeker's Matches screen.
 *
 * Three placements with one explicit rule about membership:
 *
 *   resting — terminal outcome (hired/rejected/withdrawn/expired) OR 30+
 *             days without activity. Lives behind a collapsed "Ledger"
 *             header. Mutually exclusive with the others — once a match
 *             is resting it doesn't double up anywhere.
 *
 *   active  — every non-resting match. Daily-scan rows. The honest
 *             default: any live referral belongs here.
 *
 *   fresh   — also placed here when the match is recent (accepted within
 *             FRESH_WINDOW_HOURS). Renders ON TOP as a horizontal carousel
 *             so newly-matched endorsers get visual prominence — but the
 *             SAME match still appears in active below so the user can
 *             find it via the conversation list. We deliberately allow the
 *             dual placement: the carousel is "give these recent matches
 *             a spotlight," not "hide them from the inbox."
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
 *  ALSO appears in the fresh carousel (in addition to its slot in
 *  Conversations). One week feels right: a match earned the social spotlight
 *  long enough to get over the "do I message them today?" hump, then quietly
 *  drops out of the carousel while staying live in the conversation list. */
const FRESH_WINDOW_HOURS = 168; // 7 days

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

/** True when the match is over (terminal outcome) or has gone quiet for
 *  more than the inactivity threshold. Resting is mutually exclusive with
 *  the live tiers. */
function isResting(item: SeekerPipelineItem): boolean {
  const r = item.referral;
  if (TERMINAL.has(r.status)) return true;
  const latest = latestStageTimestamp(r);
  return daysSince(latest) > RESTING_INACTIVITY_DAYS;
}

/** True when the match was accepted recently enough to deserve a spotlight
 *  in the carousel. Independent of `isResting` — resting matches never make
 *  it into the carousel because we filter them out first. */
function isFresh(item: SeekerPipelineItem): boolean {
  const r = item.referral;
  if (r.status !== 'accepted') return false;
  return hoursSince(r.acceptedAt) < FRESH_WINDOW_HOURS;
}

export interface TieredMatches {
  /** Recent acceptances — appear in the top carousel for prominence. Each
   *  item here is also present in `active` so the conversation row stays
   *  reachable in the inbox. */
  fresh: SeekerPipelineItem[];
  /** Every live (non-resting) match. The conversation list. */
  active: SeekerPipelineItem[];
  /** Terminal or stale matches. Hidden behind the collapsible "Ledger". */
  resting: SeekerPipelineItem[];
}

/**
 * Partition the full match list. `fresh` is *additive* — its members are
 * also in `active` — so a recent match shows up in BOTH the carousel and
 * the conversations list. `resting` is exclusive: resting matches don't
 * appear elsewhere. Each tier is sorted by recency (newest first).
 */
export function partitionMatches(items: SeekerPipelineItem[]): TieredMatches {
  const fresh: SeekerPipelineItem[] = [];
  const active: SeekerPipelineItem[] = [];
  const resting: SeekerPipelineItem[] = [];

  for (const it of items) {
    if (isResting(it)) {
      resting.push(it);
      continue;
    }
    active.push(it);
    if (isFresh(it)) fresh.push(it);
  }

  const byRecency = (a: SeekerPipelineItem, b: SeekerPipelineItem): number => {
    const ta = new Date(latestStageTimestamp(a.referral) ?? 0).getTime();
    const tb = new Date(latestStageTimestamp(b.referral) ?? 0).getTime();
    return tb - ta;
  };
  fresh.sort(byRecency);
  active.sort(byRecency);
  resting.sort(byRecency);
  return { fresh, active, resting };
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
