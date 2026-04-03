import { supabase } from './supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  session: Session | null;
  user: User | null;
  error: AuthError | null;
}

/**
 * Sign up with email + password.
 * Phone OTP and Google OAuth are added in Phase 2.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: { displayName: string; role: 'seeker' | 'referrer' }
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: metadata.displayName,
        role: metadata.role,
      },
    },
  });

  return {
    session: data.session,
    user: data.user,
    error,
  };
}

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    session: data.session,
    user: data.user,
    error,
  };
}

/**
 * Sign in with phone OTP — step 1: request OTP.
 */
export async function requestPhoneOtp(phone: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  return { error };
}

/**
 * Sign in with phone OTP — step 2: verify OTP.
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  return {
    session: data.session,
    user: data.user,
    error,
  };
}

/**
 * Sign out current user and clear local session.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current active session without hitting the network.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
