import type { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import type { AuthenticatedRequest } from './auth.types.js';
import type { UserRole } from '@refr/shared';

// A lightweight Supabase client used only to verify JWTs.
// We use the anon key here — the service-role key is only for admin operations.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// requireAuth verifies the Bearer token in Authorization header using Supabase's
// getUser() endpoint (validates signature + expiry against Supabase JWKS).
// After verification, it fetches the REFR User row and attaches it to req.user.
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Missing or malformed Authorization header.', 401, 'UNAUTHENTICATED');
    }

    const token = authHeader.slice(7);

    // Supabase validates token signature, expiry, and audience
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError('Invalid or expired token.', 401, 'UNAUTHENTICATED');
    }

    const supabaseUser = data.user;

    // Fetch the REFR User row to get our internal UUID and app role
    const user = await prisma.user.findUnique({
      where: { authId: supabaseUser.id },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      // Auth token is valid but user hasn't completed signup yet
      throw new AppError(
        'User profile not found. Complete signup first.',
        403,
        'PROFILE_MISSING',
      );
    }

    // Attach to request for downstream handlers
    (req as AuthenticatedRequest).user = {
      authId: supabaseUser.id,
      userId: user.id,
      email: user.email ?? undefined,
      role: user.role as UserRole,
    };

    next();
  } catch (err) {
    next(err);
  }
}

// requireRole is a follow-up middleware (must come after requireAuth) that
// restricts a route to specific roles.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authedReq = req as AuthenticatedRequest;
    if (!roles.includes(authedReq.user.role)) {
      next(
        new AppError(
          `This action requires one of these roles: ${roles.join(', ')}.`,
          403,
          'FORBIDDEN',
        ),
      );
      return;
    }
    next();
  };
}
