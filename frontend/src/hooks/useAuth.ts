import { useState, useEffect, useCallback } from 'react';
import {
  getSession,
  subscribeToAuth,
  signOut as authSignOut,
  Session,
  User,
} from '../services/auth';
import {
  isDemoScreen,
  DEMO,
  MOCK_SEEKER_SESSION,
  MOCK_REFERRER_SESSION,
} from '../config/demo';

export type AuthUser = User;

interface UseAuthReturn {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

function getDemoSession(): Session {
  return DEMO.demoRole === 'seeker'
    ? MOCK_SEEKER_SESSION
    : MOCK_REFERRER_SESSION;
}

export function useAuth(): UseAuthReturn {
  const demoActive = isDemoScreen('auth');
  const demoSession = demoActive ? getDemoSession() : null;

  const [session, setSession] = useState<Session | null>(
    demoSession,
  );
  const [user, setUser] = useState<AuthUser | null>(
    demoSession?.user ?? null,
  );
  const [loading, setLoading] = useState(!demoActive);

  useEffect(() => {
    if (demoActive) return;

    getSession()
      .then((s) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to restore session:', e);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const unsubscribe = subscribeToAuth((newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => { unsubscribe(); };
  }, [demoActive]);

  const signOut = useCallback(async () => {
    if (demoActive) return;
    await authSignOut();
  }, [demoActive]);

  return { session, user, loading, signOut };
}
