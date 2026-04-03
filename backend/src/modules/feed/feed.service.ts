import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../shared/middleware/error-handler.js';
import type { FeedResponse } from '@refr/shared';
import { mapRowToFeedCard } from '../content/content.service.js';
import { rankCards } from './feed.ranking.js';
import type { ContentCardRow } from '../content/content.types.js';
import type { FeedCursor, RankingContext } from './feed.types.js';

// ─── Cursor helpers ───────────────────────────────────────────────────────────

function encodeCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(token: string): FeedCursor {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf-8')) as FeedCursor;
  } catch {
    throw new AppError('Invalid pagination cursor.', 400, 'INVALID_CURSOR');
  }
}

// ─── Candidate pool size ───────────────────────────────────────────────────────
// We fetch POOL_MULTIPLIER × limit cards from the DB, rank them in-process,
// then return the top `limit`.  This gives the ranking function enough material
// to personalise without requiring the DB to know about viewer preferences.
// Keep the pool bounded — large pools are fine for Phase 1 (<10K cards total).
const POOL_MULTIPLIER = 5;
const MAX_POOL_SIZE = 200;

// ─── Service ──────────────────────────────────────────────────────────────────

export const FeedService = {
  /**
   * Assemble a ranked, paginated feed for the given user.
   *
   * Algorithm:
   * 1. Build viewer context (role, companies, skills) from DB profile
   * 2. Fetch a candidate pool of recent non-removed cards from Postgres
   *    (keyset-paginated by (score DESC, createdAt DESC, id ASC))
   * 3. Score and rank the pool in-process using the rule-based formula
   * 4. Slice to `limit` and encode the next cursor from the last card
   *
   * Phase 3 migration path: replace step 3 with a vector similarity search
   * against pre-computed OpenAI embeddings stored in pgvector.
   */
  async getFeed(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<FeedResponse> {
    // ── 1. Build viewer context ──────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        role: true,
        seekerProfile: {
          select: { targetCompanies: true, skills: true },
        },
        referrerProfile: {
          select: { companyId: true, canReferTo: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    const ctx: RankingContext = {
      viewerRole: user.role as 'seeker' | 'referrer',
      viewerCompanyIds:
        user.role === 'seeker'
          ? (user.seekerProfile?.targetCompanies ?? [])
          : [user.referrerProfile?.companyId ?? ''],
      viewerSkills:
        user.role === 'seeker'
          ? (user.seekerProfile?.skills ?? [])
          : (user.referrerProfile?.canReferTo ?? []),
      nowMs: Date.now(),
    };

    // ── 2. Fetch candidate pool ──────────────────────────────────────────────
    const poolSize = Math.min(params.limit * POOL_MULTIPLIER, MAX_POOL_SIZE);

    let cursorWhere = {};
    if (params.cursor) {
      const decoded = decodeCursor(params.cursor);
      // Keyset condition: cards that come after the cursor in (score DESC, createdAt DESC, id ASC)
      cursorWhere = {
        OR: [
          { score: { lt: decoded.score } },
          {
            score: decoded.score,
            createdAt: { lt: new Date(decoded.createdAt) },
          },
          {
            score: decoded.score,
            createdAt: new Date(decoded.createdAt),
            id: { gt: decoded.id },
          },
        ],
      };
    }

    const rows = await prisma.contentCard.findMany({
      where: {
        isRemoved: false,
        ...cursorWhere,
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' },
        { id: 'asc' },
      ],
      take: poolSize,
    });

    if (rows.length === 0) {
      return { cards: [], cursor: null, hasMore: false };
    }

    // ── 3. Rank in-process ───────────────────────────────────────────────────
    const candidateCards = rows.map((r) => mapRowToFeedCard(r as ContentCardRow));
    const ranked = rankCards(candidateCards, ctx);

    // ── 4. Slice and build response ──────────────────────────────────────────
    const page = ranked.slice(0, params.limit);
    const hasMore = ranked.length > params.limit || rows.length === poolSize;
    const lastCard = page[page.length - 1];

    const nextCursor =
      hasMore && lastCard
        ? encodeCursor({
            score: lastCard.rawScore,
            createdAt: lastCard.card.createdAt,
            id: lastCard.card.id,
          })
        : null;

    return {
      cards: page.map((sc) => sc.card),
      cursor: nextCursor,
      hasMore,
    };
  },
};
