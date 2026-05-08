import { requireNativeView } from 'expo';
import * as React from 'react';
import { Platform, View, type ViewProps, type ViewStyle } from 'react-native';

/**
 * Native iOS 26 Liquid Glass surface.
 *
 * On iOS 26+ this renders a real UIGlassEffect (lensing, refraction, motion
 * response) as the OS-level material. On iOS 15..25 it falls back to
 * UIBlurEffect(.systemUltraThinMaterialDark). On Android/web it renders a
 * plain View — callers should pair it with backgroundColor for a graceful
 * cross-platform look.
 *
 * Use as the BACKDROP of a glassy surface. Render content as siblings on top.
 *
 *   <View>
 *     <LiquidGlass tint="regular" cornerRadius={32} style={StyleSheet.absoluteFill} />
 *     <Text style={{ color: 'white' }}>Hello</Text>
 *   </View>
 */
export interface LiquidGlassProps extends ViewProps {
  /** "regular" (default), "clear" (high transparency), or "identity" (no effect). */
  tint?: 'regular' | 'clear' | 'identity';
  /** Hex tint color applied over the glass surface, e.g. "#0A1F44" */
  tintColor?: string;
  /** Rounds the glass with continuous corners. */
  cornerRadius?: number;
  /** iOS 26+ — enables interactive press/scale on glass surfaces. */
  interactive?: boolean;
  style?: ViewStyle;
}

const NativeLiquidGlassView: React.ComponentType<LiquidGlassProps> | null =
  Platform.OS === 'ios'
    ? (() => {
        try {
          return requireNativeView<LiquidGlassProps>('LiquidGlass');
        } catch {
          return null;
        }
      })()
    : null;

export function LiquidGlass(props: LiquidGlassProps) {
  if (NativeLiquidGlassView) {
    return <NativeLiquidGlassView {...props} />;
  }
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: 'rgba(10, 31, 68, 0.55)',
          borderRadius: props.cornerRadius ?? 0,
        },
        props.style,
      ]}
    />
  );
}

export default LiquidGlass;
