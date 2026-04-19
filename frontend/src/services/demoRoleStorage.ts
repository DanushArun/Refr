import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO } from '../config/demo';

/**
 * Persists the reviewer's chosen demo role across app launches.
 * Keeps `DEMO.demoRole` in sync as the mutable source-of-truth for the session.
 */

export type DemoRole = 'seeker' | 'referrer';

const KEY = 'endorsly_demo_role_v1';

/** Module-level flag so the router knows whether to show the picker. */
let _hasPickedRole = false;

export function hasPickedRole(): boolean {
  return _hasPickedRole;
}

export async function loadDemoRole(): Promise<DemoRole | null> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored === 'seeker' || stored === 'referrer') {
      _hasPickedRole = true;
      DEMO.demoRole = stored;
      return stored;
    }
  } catch {
    /* noop — fall back to default */
  }
  return null;
}

export async function saveDemoRole(role: DemoRole): Promise<void> {
  _hasPickedRole = true;
  DEMO.demoRole = role;
  try {
    await AsyncStorage.setItem(KEY, role);
  } catch {
    /* noop */
  }
}

export async function clearDemoRole(): Promise<void> {
  _hasPickedRole = false;
  try {
    // Writing an empty string is more reliably flushed than removeItem on iOS
    // AsyncStorage implementations. loadDemoRole treats empty-string as unset.
    await AsyncStorage.setItem(KEY, '');
  } catch {
    /* noop */
  }
}
