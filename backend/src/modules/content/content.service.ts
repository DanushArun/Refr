import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../shared/middleware/error-handler.js';
import type { FeedCard, ContentType } from '@refr/shared';
import { ContentType as ContentTypeConst } from '@refr/shared';
import type {
  ContentCardRow,
  CareerStoryPayload,
  CompanyIntelPayload,
  ContentPayload,
} from './content.types.js';

// ─── Mapping helper ────────────────────────────────────────────────────────────

// Maps a raw DB row to the shared FeedCard discriminated union.
// The payload JSONB is cast and spread — each card type has its own fields.
export function mapRowToFeedCard(row: ContentCardRow, isBookmarked = false): FeedCard {
  const base = {
    id: row.id,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    score: row.score,
    reactionCount: row.reactionCount,
    isBookmarked,
  };

  const payload = row.payload as ContentPayload;

  switch (row.type as ContentType) {
    case ContentTypeConst.CAREER_STORY: {
      const p = payload as CareerStoryPayload;
      return { ...base, type: 'career_story', ...p };
    }
    case ContentTypeConst.COMPANY_INTEL: {
      const p = payload as CompanyIntelPayload;
      return { ...base, type: 'company_intel', ...p };
    }
    case ContentTypeConst.REFERRAL_EVENT: {
      const p = payload as { referrerDisplayName: string; seekerDisplayName: string; companyName: string; eventDescription: string };
      return { ...base, type: 'referral_event', ...p };
    }
    case ContentTypeConst.MILESTONE: {
      const p = payload as { title: string; description: string; relatedUserId?: string };
      return { ...base, type: 'milestone', ...p };
    }
    case ContentTypeConst.EDITORIAL: {
      const p = payload as { title: string; body: string; author: string; tags: string[] };
      return { ...base, type: 'editorial', ...p };
    }
    default:
      throw new AppError(`Unknown content type: ${row.type}`, 500, 'CONTENT_TYPE_UNKNOWN');
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const ContentService = {
  /**
   * Create a company intel card.
   * Only verified referrers at the given company can create these.
   * The authorLabel is derived from the referrer's profile so we never
   * expose the real name.
   */
  async createCompanyIntel(params: {
    authorId: string;
    companyId: string;
    title: string;
    body: string;
    tags: string[];
    isAnonymous: boolean;
    authorLabel: string;
    companyName: string;
    companyLogo?: string;
  }): Promise<FeedCard> {
    const payload: CompanyIntelPayload = {
      companyId: params.companyId,
      companyName: params.companyName,
      companyLogo: params.companyLogo,
      authorLabel: params.authorLabel,
      title: params.title,
      body: params.body,
      tags: params.tags,
    };

    const row = await prisma.contentCard.create({
      data: {
        type: ContentTypeConst.COMPANY_INTEL,
        payload: payload as object,
        authorId: params.isAnonymous ? null : params.authorId,
        companyId: params.companyId,
        score: 0, // Will be computed by the ranking job on next cycle
      },
    });

    return mapRowToFeedCard(row as ContentCardRow);
  },

  /**
   * Create a career story card for a seeker.
   * Called automatically when a seeker completes their profile.
   * idempotent — if one already exists, it is updated in place.
   */
  async upsertCareerStoryCard(params: {
    seekerId: string;
    seekerName: string;
    seekerAvatar?: string;
    headline: string;
    story: string;
    skills: string[];
    yearsOfExperience: number;
    targetRoles: string[];
    targetCompanies: string[];
  }): Promise<FeedCard> {
    const payload: CareerStoryPayload = {
      seekerId: params.seekerId,
      seekerName: params.seekerName,
      seekerAvatar: params.seekerAvatar,
      headline: params.headline,
      story: params.story,
      skills: params.skills,
      yearsOfExperience: params.yearsOfExperience,
      targetRoles: params.targetRoles,
      targetCompanies: params.targetCompanies,
    };

    // Find existing career story card for this seeker (there should be at most one)
    const existing = await prisma.contentCard.findFirst({
      where: {
        type: ContentTypeConst.CAREER_STORY,
        authorId: params.seekerId,
        isRemoved: false,
      },
    });

    let row;
    if (existing) {
      row = await prisma.contentCard.update({
        where: { id: existing.id },
        data: { payload: payload as object },
      });
    } else {
      row = await prisma.contentCard.create({
        data: {
          type: ContentTypeConst.CAREER_STORY,
          payload: payload as object,
          authorId: params.seekerId,
          score: 0,
        },
      });
    }

    return mapRowToFeedCard(row as ContentCardRow);
  },

  /**
   * Retrieve a single content card by ID.
   * Returns 404 if not found or if removed (soft-deleted).
   */
  async getById(cardId: string, viewerId?: string): Promise<FeedCard> {
    const row = await prisma.contentCard.findUnique({
      where: { id: cardId },
    });

    if (!row || row.isRemoved) {
      throw new AppError('Content card not found.', 404, 'NOT_FOUND');
    }

    // TODO Phase 2: look up bookmark status for viewerId from a bookmarks table
    void viewerId;

    return mapRowToFeedCard(row as ContentCardRow, false);
  },

  /**
   * List content cards by type with cursor-based pagination.
   * Used by admin/editorial endpoints, not the main ranked feed.
   */
  async listByType(
    type: ContentType,
    cursor?: string,
    limit = 20,
  ): Promise<{ cards: FeedCard[]; nextCursor: string | null }> {
    const rows = await prisma.contentCard.findMany({
      where: {
        type,
        isRemoved: false,
        ...(cursor
          ? { id: { lt: cursor } } // simple ID cursor; feed uses score cursor
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to determine hasMore
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return {
      cards: page.map((r) => mapRowToFeedCard(r as ContentCardRow)),
      nextCursor,
    };
  },
};
