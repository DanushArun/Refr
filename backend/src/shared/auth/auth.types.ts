import type { Request } from 'express';
import type { UserRole } from '@refr/shared';

// The decoded JWT payload that Supabase embeds in every access token.
// We extend it with the REFR-specific fields we store in auth.users.user_metadata.
export interface SupabaseJwtPayload {
  sub: string;          // Supabase Auth UID (= User.authId in our DB)
  email?: string;
  phone?: string;
  role: string;         // Supabase internal role ("authenticated" | "anon")
  iat: number;
  exp: number;
  user_metadata?: {
    refrRole?: UserRole; // Our app-level role set on signup
  };
}

// Every authenticated route handler receives this request type.
export interface AuthenticatedRequest extends Request {
  user: {
    authId: string;     // Supabase Auth UID
    userId: string;     // REFR DB User.id (UUID)
    email?: string;
    role: UserRole;
  };
}
