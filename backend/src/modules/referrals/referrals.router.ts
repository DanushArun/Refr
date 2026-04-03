import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import { ReferralsService } from './referrals.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { UserRole } from '@refr/shared';

export const referralsRouter = Router();

const createReferralSchema = z.object({
  referrerId: z.string().uuid(),
  companyId: z.string().uuid(),
  targetRole: z.string().min(2).max(100),
  seekerNote: z.string().max(500).optional(),
  feedCardId: z.string().uuid().optional(),
});

const transitionSchema = z.object({
  status: z.enum(['accepted', 'submitted', 'interviewing', 'hired', 'rejected', 'withdrawn']),
  note: z.string().max(2000).optional(),
});

// POST /api/v1/referrals
// Seeker requests a referral (triggered from a feed card)
referralsRouter.post(
  '/',
  requireAuth,
  requireRole(UserRole.SEEKER),
  validate(createReferralSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const body = req.body as z.infer<typeof createReferralSchema>;
      const referral = await ReferralsService.createRequest({ seekerId: userId, ...body });
      res.status(201).json({ data: referral });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/referrals/inbox — referrer's incoming requests
referralsRouter.get(
  '/inbox',
  requireAuth,
  requireRole(UserRole.REFERRER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const items = await ReferralsService.getReferrerInbox(userId);
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/referrals/pipeline — seeker's pipeline view
referralsRouter.get(
  '/pipeline',
  requireAuth,
  requireRole(UserRole.SEEKER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const items = await ReferralsService.getSeekerPipeline(userId);
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/v1/referrals/:id/status — advance the state machine
referralsRouter.patch(
  '/:id/status',
  requireAuth,
  validate(transitionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { id } = req.params;
      const { status, note } = req.body as z.infer<typeof transitionSchema>;
      const updated = await ReferralsService.transition(id, userId, status, note);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);
