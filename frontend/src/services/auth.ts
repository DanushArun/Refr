import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL: string = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://127.0.0.1:8000';

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

export const notifyAuthChange = (session: Session | null) => {
  listeners.forEach((l) => l(session));
};

export const subscribeToAuth = (listener: AuthListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export async function saveSession(session: Session | null) {
  if (session) {
    await AsyncStorage.setItem('auth_session', JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem('auth_session');
  }
  notifyAuthChange(session);
}

export async function getSession(): Promise<Session | null> {
  const json = await AsyncStorage.getItem('auth_session');
  return json ? JSON.parse(json) : null;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: {
    displayName: string;
    role: 'seeker' | 'referrer';
    // Seeker profile fields
    headline?: string;
    yearsOfExperience?: number;
    skills?: string[];
    targetCompanies?: string[];
    targetRoles?: string[];
    whyLooking?: string;
    // Referrer profile fields
    company?: string;
    department?: string;
    jobTitle?: string;
    yearsAtCompany?: number;
    canReferTo?: string[];
  }
): Promise<AuthResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        email,
        password,
        display_name: metadata.displayName,
        role: metadata.role,
        // Seeker fields
        headline: metadata.headline || '',
        skills: metadata.skills || [],
        years_of_experience: metadata.yearsOfExperience || 0,
        target_companies: metadata.targetCompanies || [],
        target_roles: metadata.targetRoles || [],
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
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = typeof errorData === 'object'
        ? Object.values(errorData).flat().join(', ')
        : 'Failed to sign up';
      throw new Error(errorMsg);
    }

    // Backend returns { access, refresh, user } directly from register
    const data = await res.json();

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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to sign in');
    }

    const data = await res.json();

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

export async function requestPhoneOtp(phone: string): Promise<{ error: Error | null }> {
  return { error: new Error('Not implemented locally') };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  return { session: null, user: null, error: new Error('Not implemented locally') };
}

export async function signOut(): Promise<{ error: Error | null }> {
  await saveSession(null);
  return { error: null };
}

export const authApi = {
  signupSeeker: async (params: any) => {
    const res = await signUpWithEmail(params.email, params.password, {
      displayName: params.displayName,
      role: 'seeker',
      headline: params.headline,
      yearsOfExperience: params.yearsOfExperience,
      skills: params.skills,
      targetCompanies: params.targetCompanies,
      targetRoles: params.targetRoles,
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
