import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import { ReputationService } from './reputation.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';

export const reputationRouter = Router();

const leaderboardQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
});

// GET /api/v1/reputation/leaderboard?companyId=xxx
// Global or company-scoped Kingmaker leaderboard
reputationRouter.get(
  '/leaderboard',
  requireAuth,
  validate(leaderboardQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.query as z.infer<typeof leaderboardQuerySchema>;
      const leaderboard = await ReputationService.getLeaderboard(companyId);
      res.json({ data: leaderboard });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/reputation/me
// Authenticated referrer's own Kingmaker profile
reputationRouter.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await ReputationService.getKingmakerProfile(userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/reputation/users/:userId
// Public Kingmaker profile for any user
reputationRouter.get(
  '/users/:userId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await ReputationService.getKingmakerProfile(req.params.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);
