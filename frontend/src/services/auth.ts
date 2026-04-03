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
  metadata: { displayName: string; role: 'seeker' | 'referrer' }
): Promise<AuthResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email, // Use email as username for Django
        email,
        password,
        display_name: metadata.displayName,
        role: metadata.role,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to sign up');
    }

    // Auto sign-in after sign-up
    return await signInWithEmail(email, password);
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
    
    // Create dummy user from token for now since SimpleJWT doesn't return full user by default.
    // In a real app, you'd fetch /api/v1/users/me/ after token success
    const user: User = {
      id: 'django-user-id',
      email: email,
      displayName: email.split('@')[0],
      role: 'seeker',
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
    const res = await signUpWithEmail(params.email, params.password, { displayName: params.displayName, role: 'seeker' });
    if (res.error) throw res.error;
    return res;
  },
  signupReferrer: async (params: any) => {
    const res = await signUpWithEmail(params.email, params.password, { displayName: params.displayName, role: 'referrer' });
    if (res.error) throw res.error;
    return res;
  }
};
