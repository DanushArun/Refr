import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_SNAPPY } from '../../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Plain View style (NOT a function). Pressed state is applied separately
   *  via the spring-driven scale, so we don't need RN's `pressed` callback. */
  style?: StyleProp<ViewStyle>;
  /** Pressed-state scale. Default 0.96 — gentle but unmistakably tactile.
   *  Use 0.93 for primary CTAs that should feel weightier. */
  pressedScale?: number;
  /** Pressed-state opacity. Default 0.88. */
  pressedOpacity?: number;
}

/**
 * Drop-in replacement for RN Pressable that adds a consistent spring-driven
 * scale + opacity feedback on press. Replaces ad-hoc inline `pressed && {...}`
 * patterns across the app — every tap should feel identical regardless of
 * which screen it's on.
 *
 * Use this for any tap target where you'd otherwise write:
 *   <Pressable style={({ pressed }) => [base, pressed && { opacity: 0.8 }]}>
 *
 * It runs entirely on the UI thread (useSharedValue + Reanimated spring),
 * so the feedback fires the moment the touch lands, not after a JS round-trip.
 */
export function PressableScale({
  style,
  pressedScale = 0.96,
  pressedOpacity = 0.88,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withSpring(pressedScale, SPRING_SNAPPY);
      opacity.value = withSpring(pressedOpacity, SPRING_SNAPPY);
      onPressIn?.(e);
    },
    [pressedScale, pressedOpacity, scale, opacity, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withSpring(1, SPRING_SNAPPY);
      opacity.value = withSpring(1, SPRING_SNAPPY);
      onPressOut?.(e);
    },
    [scale, opacity, onPressOut],
  );

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children as React.ReactNode}
    </AnimatedPressable>
  );
}
