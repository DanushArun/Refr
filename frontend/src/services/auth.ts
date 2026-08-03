import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BASE_URL } from './baseUrl';
import {
  isDemoScreen,
  DEMO,
  MOCK_SEEKER_SESSION,
  MOCK_REFERRER_SESSION,
} from '../demo/config';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role?: 'seeker' | 'referrer';
  avatarUrl?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthResult {
  session: Session | null;
  user: User | null;
  error: Error | null;
}

// Simple event emitter to notify hook
type AuthListener = (session: Session | null) => void;
const listeners = new Set<AuthListener>();
const SESSION_STORAGE_KEY = 'auth_session';

export const notifyAuthChange = (session: Session | null) => {
  listeners.forEach((l) => l(session));
};

export const subscribeToAuth = (listener: AuthListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function getDemoSession(): Session {
  return DEMO.demoRole === 'seeker'
    ? MOCK_SEEKER_SESSION
    : MOCK_REFERRER_SESSION;
}

function usesWebStorage(): boolean {
  return Platform.OS === 'web';
}

async function storeSessionValue(value: string | null): Promise<void> {
  if (usesWebStorage()) {
    if (value === null) {
      globalThis.localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      globalThis.localStorage.setItem(SESSION_STORAGE_KEY, value);
    }
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
  } else {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, value);
  }
}

async function readSessionValue(): Promise<string | null> {
  if (usesWebStorage()) {
    return globalThis.localStorage.getItem(SESSION_STORAGE_KEY);
  }
  return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
}

export async function saveSession(session: Session | null): Promise<void> {
  await storeSessionValue(session ? JSON.stringify(session) : null);
  notifyAuthChange(session);
}

export async function getSession(): Promise<Session | null> {
  if (isDemoScreen('auth')) return getDemoSession();
  const value = await readSessionValue();
  if (!value) return null;

  try {
    return JSON.parse(value) as Session;
  } catch (error: unknown) {
    if (!(error instanceof SyntaxError)) throw error;
    await storeSessionValue(null);
    return null;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: {
    displayName: string;
    role: 'seeker' | 'referrer';
    avatarUrl?: string;
    // Seeker profile fields
    headline?: string;
    yearsOfExperience?: number;
    skills?: string[];
    targetCompanies?: string[];
    targetRoles?: string[];
    location?: string;
    education?: string;
    whyLooking?: string;
    // Referrer profile fields
    company?: string;
    department?: string;
    jobTitle?: string;
    yearsAtCompany?: number;
    canReferTo?: string[];
  }
): Promise<AuthResult> {
  if (isDemoScreen('auth')) {
    const session = getDemoSession();
    notifyAuthChange(session);
    return { session, user: session.user, error: null };
  }
  try {
    const res = await fetch(`${BASE_URL}/api/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        email,
        password,
        display_name: metadata.displayName,
        avatar_url: metadata.avatarUrl || '',
        role: metadata.role,
        // Seeker fields
        headline: metadata.headline || '',
        skills: metadata.skills || [],
        years_of_experience: metadata.yearsOfExperience || 0,
        target_companies: metadata.targetCompanies || [],
        target_roles: metadata.targetRoles || [],
        location: metadata.location || '',
        education: metadata.education || '',
        why_looking: metadata.whyLooking || '',
        // Referrer fields
        company: metadata.company || '',
        department: metadata.department || '',
        job_title: metadata.jobTitle || '',
        years_at_company: metadata.yearsAtCompany || 0,
        can_refer_to: metadata.canReferTo || [],
      }),
    });

    if (!res.ok) {
      const errorMsg = await parseAuthErrorResponse(res);
      throw new Error(errorMsg);
    }

    // Backend returns { access, refresh, user } directly from register
    const data = await res.json();

    if (!data?.access || !data?.refresh || !data?.user) {
      throw new Error('Sign up response was missing auth details.');
    }

    const user: User = {
      id: String(data.user?.id ?? ''),
      email: data.user?.email ?? email,
      displayName: data.user?.displayName ?? metadata.displayName,
      role: data.user?.role ?? metadata.role,
      avatarUrl: data.user?.avatarUrl ?? undefined,
    };

    const session: Session = {
      access_token: data.access,
      refresh_token: data.refresh,
      user,
    };

    await saveSession(session);
    return { session, user, error: null };
  } catch (error: any) {
    return { session: null, user: null, error };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (isDemoScreen('auth')) {
    const session = getDemoSession();
    notifyAuthChange(session);
    return { session, user: session.user, error: null };
  }
  try {
    const res = await fetch(`${BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        password,
      }),
    });

    if (!res.ok) {
      const errorMsg = await parseAuthErrorResponse(res);
      throw new Error(errorMsg);
    }

    const data = await res.json();
    if (!data?.access || !data?.refresh || !data?.user) {
      throw new Error('Sign in response was missing auth details.');
    }

    // CustomTokenObtainPairView returns { access, refresh, user }
    const userData = data.user;
    const user: User = {
      id: String(userData?.id ?? ''),
      email: userData?.email ?? email,
      displayName: userData?.displayName ?? email.split('@')[0],
      role: userData?.role ?? 'seeker',
      avatarUrl: userData?.avatarUrl ?? undefined,
    };

    const session: Session = {
      access_token: data.access,
      refresh_token: data.refresh,
      user,
    };

    await saveSession(session);

    return { session, user, error: null };
  } catch (error: any) {
    return { session: null, user: null, error };
  }
}

async function parseAuthErrorResponse(res: Response): Promise<string> {
  const status = res.status;
  const body = await res.text();

  if (!body) {
    return `Request failed with status ${status}.`;
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const detail = extractErrorDetail(parsed);
    if (detail) {
      return detail;
    }
  } catch {
    return `Request failed with status ${status}: ${body.slice(0, 180)}`;
  }

  return `Request failed with status ${status}.`;
}

function extractErrorDetail(payload: Record<string, unknown>): string {
  if (typeof payload.detail === 'string') {
    return payload.detail;
  }
  if (typeof payload.message === 'string') {
    return payload.message;
  }
  if (typeof payload.error === 'string') {
    return payload.error;
  }
  const allValues = Object.values(payload).flatMap((value) => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string') as string[];
    return [];
  });
  return allValues.join(', ');
}

export async function requestPhoneOtp(phone: string): Promise<{ error: Error | null }> {
  return { error: new Error('Not implemented locally') };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  return { session: null, user: null, error: new Error('Not implemented locally') };
}

export async function signOut(): Promise<{ error: Error | null }> {
  if (isDemoScreen('auth')) return { error: null };
  try {
    await saveSession(null);
    return { error: null };
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error : new Error('Unable to clear the local session.'),
    };
  }
}

export const authApi = {
  signupSeeker: async (params: any) => {
    const res = await signUpWithEmail(params.email, params.password, {
      displayName: params.displayName,
      role: 'seeker',
      headline: params.headline,
      avatarUrl: params.avatarUrl,
      yearsOfExperience: params.yearsOfExperience,
      skills: params.skills,
      targetCompanies: params.targetCompanies,
      targetRoles: params.targetRoles,
      location: params.location,
      education: params.education,
      whyLooking: params.whyLooking,
    });
    if (res.error) throw res.error;
    return res;
  },
  signupReferrer: async (params: any) => {
    const res = await signUpWithEmail(params.email, params.password, {
      displayName: params.displayName,
      role: 'referrer',
      company: params.company,
      department: params.department,
      jobTitle: params.jobTitle,
      yearsAtCompany: params.yearsAtCompany,
      canReferTo: params.canReferTo,
    });
    if (res.error) throw res.error;
    return res;
  },
};
