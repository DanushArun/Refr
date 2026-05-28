import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { playSensoryEvent } from '../utils/haptics';
import {
  getHapticsEnabledSnapshot,
  loadHapticsPreference,
  setHapticsEnabledPreference,
} from '../utils/sensoryPreferences';

type SensorySettings = {
  hapticsEnabled: boolean;
  reduceMotionEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
};

function warnReduceMotionFailure(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`Reduce motion preference read failed: ${detail}`);
}

export function useSensorySettings(): SensorySettings {
  const [hapticsEnabled, setHapticsEnabledState] = useState(getHapticsEnabledSnapshot());
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    loadHapticsPreference().then(setHapticsEnabledState);
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotionEnabled)
      .catch(warnReduceMotionFailure);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );
    return () => sub.remove();
  }, []);

  const setHapticsEnabled = useCallback(async (enabled: boolean) => {
    await setHapticsEnabledPreference(enabled);
    setHapticsEnabledState(enabled);
    if (enabled) void playSensoryEvent('control.select');
  }, []);

  return { hapticsEnabled, reduceMotionEnabled, setHapticsEnabled };
}
