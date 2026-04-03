import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { signOut as authSignOut } from '../services/auth';

/**
 * Lightweight user shape extracted from Supabase session metadata.
 * Full profile is fetched from /users/me via profileApi.
 */
export interface AuthUser {
  id: string;
  email: string | undefined;
  displayName: string;
  role: 'seeker' | 'referrer' | null;
  avatarUrl: string | undefined;
}

interface UseAuthReturn {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

function extractUser(session: Session): AuthUser {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: (meta['display_name'] as string | undefined) ?? 'User',
    role: (meta['role'] as 'seeker' | 'referrer' | undefined) ?? null,
    avatarUrl: (meta['avatar_url'] as string | undefined),
  };
}

/**
 * useAuth — subscribes to Supabase auth state changes.
 *
 * Handles the initial session load and all subsequent sign-in / sign-out events.
 * Components that need auth state should use this hook; avoid calling
 * supabase.auth directly in components.
 */
export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session that may already exist on app resume
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s ? extractUser(s) : null);
      setLoading(false);
    });

    // Subscribe to auth state changes (sign in, token refresh, sign out)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession ? extractUser(newSession) : null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    // onAuthStateChange will clear state above
  }, []);

  return { session, user, loading, signOut };
}
