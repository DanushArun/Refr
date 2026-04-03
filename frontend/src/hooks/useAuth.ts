import { useState, useEffect, useCallback } from 'react';
import { getSession, subscribeToAuth, signOut as authSignOut, Session, User } from '../services/auth';

export type AuthUser = User;

interface UseAuthReturn {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    getSession()
      .then((s) => {
        setSession(s);
        setUser(s?.user || null);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to restore session:', e);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Subscribe to changes
    const unsubscribe = subscribeToAuth((newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  return { session, user, loading, signOut };
}
