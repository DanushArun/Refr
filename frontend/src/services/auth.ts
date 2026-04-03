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

// ─── Onboarding helpers ────────────────────────────────────────────────────
// These combine Supabase Auth signup + REFR profile creation in one call.

const API_BASE = 'http://localhost:3000';

async function apiPost(path: string, body: unknown, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const authApi = {
  signupSeeker: async (params: {
    displayName: string;
    email: string;
    password: string;
    headline: string;
    yearsOfExperience: number;
    skills: string[];
    targetCompanies: string[];
    whyLooking: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { display_name: params.displayName, role: 'seeker' } },
    });
    if (error || !authData.user) throw error ?? new Error('Signup failed');

    const token = authData.session?.access_token;

    // Create REFR user row
    await apiPost('/api/v1/users/signup', {
      authId: authData.user.id,
      email: params.email,
      role: 'seeker',
      displayName: params.displayName,
    }, token);

    // Create seeker profile
    await apiPost('/api/v1/users/me/seeker-profile', {
      headline: params.headline,
      yearsOfExperience: params.yearsOfExperience,
      skills: params.skills,
      targetCompanies: params.targetCompanies,
      careerStory: params.whyLooking,
      targetRoles: [],
      whyLooking: params.whyLooking,
    }, token);

    return authData;
  },

  signupReferrer: async (params: {
    displayName: string;
    email: string;
    password: string;
    company: string;
    department: string;
    jobTitle: string;
    yearsAtCompany: number;
    canReferTo: string[];
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { display_name: params.displayName, role: 'referrer' } },
    });
    if (error || !authData.user) throw error ?? new Error('Signup failed');

    const token = authData.session?.access_token;

    await apiPost('/api/v1/users/signup', {
      authId: authData.user.id,
      email: params.email,
      role: 'referrer',
      displayName: params.displayName,
    }, token);

    await apiPost('/api/v1/users/me/referrer-profile', {
      companyName: params.company,
      department: params.department,
      jobTitle: params.jobTitle,
      yearsAtCompany: params.yearsAtCompany,
      canReferTo: params.canReferTo,
    }, token);

    return authData;
  },
};
