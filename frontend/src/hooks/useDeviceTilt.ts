import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import {
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

interface DeviceTilt {
  /** -1..1, where positive = device tilted right */
  tiltX: SharedValue<number>;
  /** -1..1, where positive = device tilted forward */
  tiltY: SharedValue<number>;
}

const SMOOTH_DURATION = 220;
const SAMPLE_INTERVAL_MS = 60; // ~16fps for sensor; smoothing fills the gaps

/**
 * Subscribe to device motion and expose smoothed, normalized tilt values.
 * Values clamp to [-1, 1] and are softened with a short timing animation
 * so the consumer can drive Skia/Reanimated transforms without jitter.
 *
 * Gracefully no-ops on web or when permissions are denied — values stay 0.
 */
export function useDeviceTilt(enabled = true): DeviceTilt {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      tiltX.value = withTiming(0, { duration: SMOOTH_DURATION });
      tiltY.value = withTiming(0, { duration: SMOOTH_DURATION });
      return;
    }
    if (Platform.OS === 'web') return;

    let mounted = true;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      const available = await DeviceMotion.isAvailableAsync().catch(() => false);
      if (!available || !mounted) return;

      const granted = await DeviceMotion.requestPermissionsAsync()
        .then((r) => r.granted)
        .catch(() => true);
      if (!granted || !mounted) return;

      DeviceMotion.setUpdateInterval(SAMPLE_INTERVAL_MS);

      subscription = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
        // rotation.gamma = roll (left-right), rotation.beta = pitch (forward-back)
        // Both ~ -π/2..π/2; normalize to -1..1 then clamp to a small comfort range
        const rawX = clamp(rotation.gamma / (Math.PI / 4), -1, 1);
        const rawY = clamp(rotation.beta / (Math.PI / 4), -1, 1);
        const config = {
          duration: SMOOTH_DURATION,
          easing: Easing.out(Easing.quad),
        };
        tiltX.value = withTiming(rawX, config);
        tiltY.value = withTiming(rawY, config);
      });
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [enabled, tiltX, tiltY]);

  return { tiltX, tiltY };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
