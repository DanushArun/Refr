import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

interface HapticEngineNative {
  isSupported: () => boolean;
  play: (pattern: string) => void;
  playAhap: (json: string) => void;
}

const Native = Platform.OS === 'ios'
  ? requireOptionalNativeModule<HapticEngineNative>('HapticEngine')
  : null;

export type AhapPattern =
  | 'match'
  | 'hire'
  | 'ritual'
  | 'swipe-request'
  | 'swipe-pass';

/** True only on iOS hardware that supports CoreHaptics + the native module is linked. */
export function isAhapSupported(): boolean {
  return Native?.isSupported?.() ?? false;
}

/** Play a bundled AHAP pattern by name. Silently no-ops if unsupported. */
export function playAhap(pattern: AhapPattern): void {
  Native?.play?.(pattern);
}

/** Play an inline AHAP JSON pattern. Silently no-ops if unsupported. */
export function playAhapJson(json: string): void {
  Native?.playAhap?.(json);
}
