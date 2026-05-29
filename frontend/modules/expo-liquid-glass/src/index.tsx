import * as React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * Liquid Glass surface.
 *
 * Strategy:
 *   - iOS 26+ (real UIGlassEffect available): delegate to expo-glass-effect's
 *     GlassView for lensing, refraction, and the interactive press response.
 *   - iOS < 26: fall back to expo-blur's BlurView with a dark tint — this is
 *     necessary because expo-glass-effect renders a NO-OP UIVisualEffect when
 *     UIGlassEffect is unavailable (i.e. completely transparent), which is
 *     why the tab bar looked invisible.
 *   - Android: BlurView with `experimentalBlurMethod="dimezisBlurView"` so we
 *     still get a real frosted backdrop instead of a flat color.
 *
 * The custom native scaffolding under modules/expo-liquid-glass/ios/ is kept
 * for future bespoke effects but is not used by default — `requireNativeView`
 * was failing at runtime because the module hadn't been registered with
 * expo-modules-core.
 */
export interface LiquidGlassProps extends ViewProps {
  /** "regular" (default), "clear" (high transparency), or "identity" (no effect). */
  tint?: 'regular' | 'clear' | 'identity';
  /** Hex tint color applied over the glass surface, e.g. "#0A1F44" */
  tintColor?: string;
  /** 0–1 strength of the colored tint overlay. Defaults to 0.20. */
  tintIntensity?: number;
  /** Rounds the glass with continuous corners. */
  cornerRadius?: number;
  /** iOS 26+ — enables interactive press/scale on glass surfaces. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}

type GlassViewLike = React.ComponentType<{
  glassEffectStyle?: 'clear' | 'regular' | 'none';
  tintColor?: string;
  isInteractive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}>;

// Resolve expo-glass-effect lazily so this module still loads in environments
// where it isn't available (Android-only builds, missing native module, etc.).
const glassEffectMod: {
  GlassView: GlassViewLike | null;
  isAvailable: () => boolean;
} = (() => {
  if (Platform.OS !== 'ios') {
    return { GlassView: null, isAvailable: () => false };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-glass-effect');
    const GlassView = (mod.GlassView ?? mod.default) as GlassViewLike | null;
    const isLiquidGlassAvailable = mod.isLiquidGlassAvailable as
      | (() => boolean)
      | undefined;
    return {
      GlassView,
      isAvailable: () => {
        try {
          return isLiquidGlassAvailable ? !!isLiquidGlassAvailable() : false;
        } catch {
          return false;
        }
      },
    };
  } catch {
    return { GlassView: null, isAvailable: () => false };
  }
})();

function mapTint(tint: LiquidGlassProps['tint']): 'clear' | 'regular' | 'none' {
  if (tint === 'clear') return 'clear';
  if (tint === 'identity') return 'none';
  return 'regular';
}

function blurIntensityFor(tint: LiquidGlassProps['tint']): number {
  if (tint === 'clear') return 60;
  if (tint === 'identity') return 0;
  return 92;
}

export function LiquidGlass({
  tint = 'regular',
  tintColor,
  tintIntensity = 0.2,
  cornerRadius,
  interactive,
  style,
  children,
  ...rest
}: LiquidGlassProps) {
  // Round-with-overflow-hidden so the glass surface is clipped to the corner
  // radius regardless of which underlying renderer ends up being used. The
  // parent (e.g. tab bar capsule) also clips, but we set it here for safety
  // because BlurView/GlassView need an explicit borderRadius to round.
  const baseStyle: ViewStyle = cornerRadius
    ? { borderRadius: cornerRadius, overflow: 'hidden' }
    : {};

  const useNativeGlass = glassEffectMod.GlassView && glassEffectMod.isAvailable();

  if (useNativeGlass && glassEffectMod.GlassView) {
    const GlassView = glassEffectMod.GlassView;
    return (
      <GlassView
        glassEffectStyle={mapTint(tint)}
        tintColor={tintColor}
        isInteractive={interactive}
        style={[baseStyle, style]}
        {...rest}
      >
        {children}
        {tintColor && tintIntensity > 0 ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: tintColor,
                opacity: tintIntensity,
                borderRadius: cornerRadius ?? 0,
              },
            ]}
          />
        ) : null}
      </GlassView>
    );
  }

  // Fallback path: real BlurView on iOS < 26 and Android. This is the load-
  // bearing branch when UIGlassEffect isn't available — without it, the
  // surface would be invisible.
  return (
    <View {...rest} style={[baseStyle, style]}>
      <BlurView
        intensity={blurIntensityFor(tint)}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={[
          StyleSheet.absoluteFillObject,
          cornerRadius ? { borderRadius: cornerRadius } : null,
        ]}
      />
      {tintColor && tintIntensity > 0 ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: tintColor,
              opacity: tintIntensity,
              borderRadius: cornerRadius ?? 0,
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

export default LiquidGlass;
