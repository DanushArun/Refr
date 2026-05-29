import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  /** Shape width — number (px) or percentage string. Default 100%. */
  width?: number | string;
  /** Shape height in px. */
  height: number;
  /** Corner radius. Default 8. Use width/2 for circles. */
  radius?: number;
  /** Override container style (margin etc.) — backgroundColor is reserved. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton placeholder block with a continuous opacity shimmer.
 *
 * Replaces `<ActivityIndicator>` spinners on screens that render structured
 * content. The shimmering blocks let the user start reading the *layout* of
 * what's coming before the data lands, which dramatically reduces the
 * jarring spinner → content jump.
 *
 * Use composition: assemble multiple Skeletons in the shape of the real
 * content. Each screen builds its own SkeletonBundle in the same module.
 *
 * Usage:
 *   if (loading) return <SkeletonCard />;
 *   return <RealCard data={data} />;
 *
 * The shimmer is a single shared opacity value driven by `withRepeat`.
 * Cheaper than per-block animated gradients and reads as "loading" without
 * being distracting.
 */
export function Skeleton({ width = '100%', height, radius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.95, {
        duration: 850,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        // width can be number or string — RN accepts both at runtime.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { width: width as any, height, borderRadius: radius },
        style,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
