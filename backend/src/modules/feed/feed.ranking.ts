import type { FeedCard } from '@refr/shared';
import type { RankingContext, ScoredCard } from './feed.types.js';

// ─── Scoring constants ────────────────────────────────────────────────────────
// These weights are the Phase 1 rule-based formula.
// In Phase 3, replace with a learned model (OpenAI embeddings + linear layer).

// Recency: half-life in hours — score halves every RECENCY_HALF_LIFE_H hours.
const RECENCY_HALF_LIFE_H = 12;

// Component weights sum to 1.0
const WEIGHTS = {
  // Recency is the most important signal in an early-stage feed
  recency: 0.45,
  // Relevance (personalisation) is the second strongest signal
  relevance: 0.35,
  // Popularity is capped to prevent viral runaway
  popularity: 0.20,
} as const;

// Max reaction count before popularity score saturates (log-capped)
const POPULARITY_CAP = 500;

// ─── Per-component scoring functions ─────────────────────────────────────────

/**
 * Recency score: exponential decay from 1.0 (just published) to ~0 (old).
 * Formula: 2^(-ageHours / halfLife)
 *
 * Examples:
 *   0h old  → 1.000
 *   12h old → 0.500
 *   24h old → 0.250
 *   48h old → 0.125
 *   7 days  → ~0.002
 */
function recencyScore(createdAt: string, nowMs: number): number {
  const ageHours = (nowMs - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return Math.pow(2, -ageHours / RECENCY_HALF_LIFE_H);
}

/**
 * Popularity score: log-normalised reaction count, capped at POPULARITY_CAP.
 * log(1 + reactionCount) / log(1 + CAP) gives a 0–1 range that saturates
 * gracefully so massively viral cards don't dominate the feed.
 */
function popularityScore(reactionCount: number): number {
  const capped = Math.min(reactionCount, POPULARITY_CAP);
  return Math.log(1 + capped) / Math.log(1 + POPULARITY_CAP);
}

/**
 * Relevance score: rule-based personalisation (0.0–1.0).
 *
 * For SEEKER viewers:
 *   - career_story cards from people with matching skills score higher
 *   - company_intel cards about their target companies score highest
 *   - referral_event and milestone cards score baseline 0.5
 *   - editorial always scores 0.4 (platform content, not personalised)
 *
 * For REFERRER viewers:
 *   - career_story cards where seeker targets the referrer's company score highest
 *   - company_intel about their own company scores high (local context)
 *   - referral_event cards score 0.6 (social proof)
 *   - editorial scores 0.4
 */
function relevanceScore(card: FeedCard, ctx: RankingContext): number {
  if (ctx.viewerRole === 'seeker') {
    switch (card.type) {
      case 'career_story': {
        // Skills overlap: Jaccard similarity between viewer skills and card skills
        const cardSkills = new Set(card.skills.map((s) => s.toLowerCase()));
        const viewerSkills = new Set(ctx.viewerSkills.map((s) => s.toLowerCase()));
        const intersection = [...viewerSkills].filter((s) => cardSkills.has(s)).length;
        const union = new Set([...viewerSkills, ...cardSkills]).size;
        const skillJaccard = union > 0 ? intersection / union : 0;

        // Target company overlap
        const cardCompanies = new Set(card.targetCompanies.map((c) => c.toLowerCase()));
        const viewerCompanies = new Set(ctx.viewerCompanyIds.map((c) => c.toLowerCase()));
        const companyMatch = [...viewerCompanies].some((c) => cardCompanies.has(c)) ? 0.3 : 0;

        return Math.min(1.0, 0.5 + skillJaccard * 0.2 + companyMatch);
      }

      case 'company_intel': {
        // Seekers care most about intel on their target companies
        const isTargetCompany = ctx.viewerCompanyIds.includes(card.companyId);
        return isTargetCompany ? 0.9 : 0.4;
      }

      case 'referral_event':
        return 0.5; // social proof but not directly actionable for seekers

      case 'milestone':
        return 0.5; // inspirational content

      case 'editorial':
        return 0.4; // platform content — same for everyone
    }
  }

  // Referrer viewer
  switch (card.type) {
    case 'career_story': {
      // Referrers care about seekers targeting their company
      const seekerTargetsReferrerCompany = card.targetCompanies.some((c) =>
        ctx.viewerCompanyIds.includes(c),
      );
      const skillsMatch = card.skills.some((s) =>
        ctx.viewerSkills.map((v) => v.toLowerCase()).includes(s.toLowerCase()),
      );
      let score = 0.3;
      if (seekerTargetsReferrerCompany) score += 0.5;
      if (skillsMatch) score += 0.2;
      return Math.min(1.0, score);
    }

    case 'company_intel': {
      const isOwnCompany = ctx.viewerCompanyIds.includes(card.companyId);
      return isOwnCompany ? 0.8 : 0.3;
    }

    case 'referral_event':
      return 0.6; // social proof — referrers follow each other's activity

    case 'milestone':
      return 0.5;

    case 'editorial':
      return 0.4;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Score a single content card given viewer context.
 * Returns a ScoredCard with all three components and the weighted final score.
 * Final score is in the range [0, 1].
 */
export function scoreCard(card: FeedCard, ctx: RankingContext): ScoredCard {
  const recency = recencyScore(card.createdAt, ctx.nowMs);
  const relevance = relevanceScore(card, ctx);
  const popularity = popularityScore(card.reactionCount);

  const rawScore =
    WEIGHTS.recency * recency +
    WEIGHTS.relevance * relevance +
    WEIGHTS.popularity * popularity;

  return {
    card,
    rawScore,
    recencyComponent: recency,
    relevanceComponent: relevance,
    popularityComponent: popularity,
  };
}

/**
 * Sort and rank an array of candidate cards for a specific viewer.
 * Returns sorted descending by rawScore.
 * Ties are broken by createdAt DESC then id ASC for stable ordering.
 */
export function rankCards(cards: FeedCard[], ctx: RankingContext): ScoredCard[] {
  const scored = cards.map((c) => scoreCard(c, ctx));
  return scored.sort((a, b) => {
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    const aTime = new Date(a.card.createdAt).getTime();
    const bTime = new Date(b.card.createdAt).getTime();
    if (bTime !== aTime) return bTime - aTime;
    return a.card.id.localeCompare(b.card.id);
  });
}
