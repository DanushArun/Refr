import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import { AppError } from '../../shared/middleware/error-handler.js';
import { prisma } from '../../lib/prisma.js';
import { createCompanyIntelSchema } from '@refr/shared';
import { ContentService } from './content.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import type { ContentType } from '@refr/shared';

export const contentRouter = Router();

// POST /api/v1/content
// Create a new company intel card. Only referrers with verified status can post.
contentRouter.post(
  '/',
  requireAuth,
  requireRole('referrer'),
  validate(createCompanyIntelSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const body = req.body as z.infer<typeof createCompanyIntelSchema>;

      // Fetch referrer profile to get company name, logo, and posting settings
      const referrerProfile = await prisma.referrerProfile.findUnique({
        where: { userId },
        include: { company: { select: { id: true, name: true, logoUrl: true } } },
      });

      if (!referrerProfile) {
        throw new AppError('Referrer profile not found.', 404, 'PROFILE_MISSING');
      }

      // Referrer can only post intel about their own company
      if (referrerProfile.companyId !== body.companyId) {
        throw new AppError(
          'You can only post company intel about your own employer.',
          403,
          'FORBIDDEN',
        );
      }

      const authorLabel = referrerProfile.isAnonymousPostingEnabled
        ? `Verified employee at ${referrerProfile.company.name}`
        : (await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } }))
            ?.displayName ?? 'REFR Member';

      const card = await ContentService.createCompanyIntel({
        authorId: userId,
        companyId: body.companyId,
        title: body.title,
        body: body.body,
        tags: body.tags,
        isAnonymous: referrerProfile.isAnonymousPostingEnabled,
        authorLabel,
        companyName: referrerProfile.company.name,
        companyLogo: referrerProfile.company.logoUrl ?? undefined,
      });

      res.status(201).json({ data: card });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/content/:id
// Retrieve a single content card by ID.
contentRouter.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const card = await ContentService.getById(req.params.id, userId);
      res.json({ data: card });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/content?type=company_intel&cursor=xxx&limit=20
// List content cards by type (admin / editorial use).
const listQuerySchema = z.object({
  type: z.enum([
    'career_story',
    'company_intel',
    'referral_event',
    'milestone',
    'editorial',
  ]),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

contentRouter.get(
  '/',
  requireAuth,
  validate(listQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as z.infer<typeof listQuerySchema>;
      const result = await ContentService.listByType(
        query.type as ContentType,
        query.cursor,
        query.limit,
      );
      res.json({ data: result.cards, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      next(err);
    }
  },
);
