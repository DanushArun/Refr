import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createSeekerProfileSchema,
  createReferrerProfileSchema,
  updateProfileSchema,
} from '@refr/shared';
import { UsersService } from './users.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';
import { UserRole } from '@refr/shared';

export const usersRouter = Router();

// POST /api/v1/users/signup
// Called once immediately after Supabase Auth signup (before onboarding).
// Body must include the Supabase authId so we can link to auth.users.
const signupSchema = z.object({
  authId: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum([UserRole.SEEKER, UserRole.REFERRER]),
  displayName: z.string().min(2).max(50),
});

usersRouter.post(
  '/signup',
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as z.infer<typeof signupSchema>;
      const result = await UsersService.createUser(body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/users/me
// Returns the full profile of the authenticated user.
usersRouter.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await UsersService.getProfile(userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/v1/users/me
// Partial update of profile fields.
usersRouter.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await UsersService.updateProfile(userId, req.body);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/users/me/seeker-profile
// Onboarding step 2 for seekers: submit guided story prompts + metadata.
usersRouter.post(
  '/me/seeker-profile',
  requireAuth,
  validate(createSeekerProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await UsersService.createSeekerProfile(userId, req.body);
      res.status(201).json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/users/me/referrer-profile
// Onboarding step 2 for referrers: submit company + department details.
usersRouter.post(
  '/me/referrer-profile',
  requireAuth,
  validate(createReferrerProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await UsersService.createReferrerProfile(userId, req.body);
      res.status(201).json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
);
