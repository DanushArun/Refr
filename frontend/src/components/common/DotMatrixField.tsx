import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Canvas, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  buildDotMatrixPoints,
  clampDotMatrixProgress,
  splitDotMatrixPoints,
  type DotMatrixPoint,
} from '../../lib/visual/dotMatrix';
import { colors } from '../../theme/colors';

type DotMatrixVariant = 'static' | 'progress' | 'pulse';
type DotMatrixTone = 'dark' | 'paper';

interface DotMatrixFieldProps {
  variant?: DotMatrixVariant;
  tone?: DotMatrixTone;
  progress?: number;
  active?: boolean;
  cellSize?: number;
  dotRadius?: number;
  style?: StyleProp<ViewStyle>;
}

interface LayoutSize {
  width: number;
  height: number;
}

interface DotMatrixPathConfig {
  size: LayoutSize;
  cellSize: number;
  progress: number;
  variant: DotMatrixVariant;
  dotRadius: number;
}

const DEFAULT_CELL = 10;
const DEFAULT_DOT = 1.05;

export function DotMatrixField({
  variant = 'static',
  tone = 'dark',
  progress = 0,
  active = false,
  cellSize = DEFAULT_CELL,
  dotRadius = DEFAULT_DOT,
  style,
}: DotMatrixFieldProps): React.ReactElement {
  if (Platform.OS === 'web') {
    return <View style={[styles.wrap, styles.webFallback, style]} />;
  }
  const { size, onLayout } = useMeasuredSize();
  const { dimPath, litPath, points } = useDotMatrixPaths({
    size,
    cellSize,
    progress,
    variant,
    dotRadius,
  });
  const palette = resolvePalette(tone);
  const litLayerStyle = usePulseStyle({ active, variant });

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout} pointerEvents="none">
      {points.length > 0 && (
        <>
          <Canvas style={StyleSheet.absoluteFillObject}>
            <Path path={dimPath} color={palette.dim} opacity={palette.dimOpacity} />
          </Canvas>
          <Animated.View style={[StyleSheet.absoluteFillObject, litLayerStyle]}>
            <Canvas style={StyleSheet.absoluteFillObject}>
              <Path path={litPath} color={palette.lit} opacity={palette.litOpacity} />
            </Canvas>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function useMeasuredSize(): {
  size: LayoutSize;
  onLayout: (event: LayoutChangeEvent) => void;
} {
  const [size, setSize] = useState<LayoutSize>({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    if (width === size.width && height === size.height) return;
    setSize({ width, height });
  };
  return { size, onLayout };
}

function useDotMatrixPaths(config: DotMatrixPathConfig): {
  dimPath: SkPath;
  litPath: SkPath;
  points: DotMatrixPoint[];
} {
  const { size, cellSize, progress, variant, dotRadius } = config;
  const points = useMemo(
    () => buildDotMatrixPoints({ width: size.width, height: size.height, cellSize }),
    [cellSize, size.height, size.width],
  );
  const split = useMemo(
    () =>
      splitDotMatrixPoints({
        points,
        progress: clampDotMatrixProgress(progress),
        width: size.width,
      }),
    [points, progress, size.width],
  );
  const dimPath = useMemo(() => buildPath(dimPoints(variant, split.dim, points), dotRadius), [
    dotRadius,
    points,
    split.dim,
    variant,
  ]);
  const litPath = useMemo(() => buildPath(litPoints(variant, split.lit, points), dotRadius), [
    dotRadius,
    points,
    split.lit,
    variant,
  ]);
  return { dimPath, litPath, points };
}

function usePulseStyle(config: {
  active: boolean;
  variant: DotMatrixVariant;
}) {
  const litLayerOpacity = useSharedValue(config.variant === 'pulse' ? 0.36 : 1);
  const litLayerStyle = useAnimatedStyle(() => ({
    opacity: litLayerOpacity.value,
  }));

  useEffect(() => {
    if (config.variant === 'pulse' && config.active) {
      litLayerOpacity.value = withRepeat(
        withTiming(1, pulseTimingConfig),
        -1,
        true,
      );
      return;
    }

    litLayerOpacity.value = withTiming(config.variant === 'pulse' ? 0.36 : 1, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [config.active, config.variant, litLayerOpacity]);

  return litLayerStyle;
}

const pulseTimingConfig = {
  duration: 860,
  easing: Easing.inOut(Easing.sin),
  reduceMotion: ReduceMotion.System,
} as const;

function dimPoints(
  variant: DotMatrixVariant,
  dim: readonly DotMatrixPoint[],
  points: readonly DotMatrixPoint[],
): readonly DotMatrixPoint[] {
  return variant === 'static' ? points : dim;
}

function litPoints(
  variant: DotMatrixVariant,
  lit: readonly DotMatrixPoint[],
  points: readonly DotMatrixPoint[],
): readonly DotMatrixPoint[] {
  if (variant === 'static') return [];
  if (variant === 'pulse') return points.filter((_, index) => index % 5 === 0);
  return lit;
}

function buildPath(points: readonly DotMatrixPoint[], radius: number): SkPath {
  const path = Skia.Path.Make();
  points.forEach((point) => path.addCircle(point.x, point.y, radius));
  return path;
}

function resolvePalette(tone: DotMatrixTone): {
  dim: string;
  lit: string;
  dimOpacity: number;
  litOpacity: number;
} {
  if (tone === 'paper') {
    return {
      dim: colors.background,
      lit: colors.gold,
      dimOpacity: 0.08,
      litOpacity: 0.34,
    };
  }

  return {
    dim: colors.text,
    lit: colors.goldBright,
    dimOpacity: 0.09,
    litOpacity: 0.44,
  };
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    opacity: 0.48,
  },
});
