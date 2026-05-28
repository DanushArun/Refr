import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAPTICS_ENABLED_KEY = '@endorsly/haptics-enabled';

let hapticsEnabled = true;

function warnPreferenceFailure(action: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`Haptic preference ${action} failed: ${detail}`);
}

export function getHapticsEnabledSnapshot(): boolean {
  return hapticsEnabled;
}

export async function loadHapticsPreference(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    hapticsEnabled = stored !== 'false';
  } catch (error) {
    hapticsEnabled = true;
    warnPreferenceFailure('load', error);
  }

  return hapticsEnabled;
}

export async function setHapticsEnabledPreference(enabled: boolean): Promise<void> {
  hapticsEnabled = enabled;
  try {
    await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    warnPreferenceFailure('save', error);
  }
}

export function resetHapticsPreferenceForTests(): void {
  hapticsEnabled = true;
}
