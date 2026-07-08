import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import {
  Easing,
  type DerivedValue,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Canvas,
  Group,
  Path,
  RadialGradient,
  Skia,
  vec,
  type SkPath,
  type Vector,
} from '@shopify/react-native-skia';
import { buildDotMatrixPoints } from '../../lib/visual/dotMatrix';

interface CenterPulseDotMatrixBackgroundProps {
  cellSize?: number;
}

interface MeasuredSize {
  width: number;
  height: number;
}

interface SignalCanvasProps {
  cellSize: number;
  size: MeasuredSize;
}

const SIGNAL_LOOP_MS = 3500;
const BASE_RADIUS_MULTIPLIER = 1.5;
const RING_PEAK_POSITION = 0.84;
const OFFSCREEN_EXIT_MULTIPLIER = 1.22;
const SIGNAL_COLORS = [
  'rgba(212, 167, 68, 0)',
  'rgba(255, 213, 106, 0.76)',
  'rgba(212, 167, 68, 0)',
];
const SIGNAL_POSITIONS = [0.66, 0.84, 1];

export function CenterPulseDotMatrixBackground({
  cellSize = 16,
}: CenterPulseDotMatrixBackgroundProps): React.ReactElement {
  if (Platform.OS === 'web') return <View style={styles.webFallback} />;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    if (size.width !== width || size.height !== height) {
      setSize({ width, height });
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} onLayout={onLayout} pointerEvents="none">
      {size.width > 0 && size.height > 0 ? (
        <SignalCanvas cellSize={cellSize} size={size} />
      ) : null}
    </View>
  );
}

function SignalCanvas({ cellSize, size }: SignalCanvasProps): React.ReactElement | null {
  const pulse = useSharedValue(0);
  const maxRadius = getOffscreenRadius(size);
  const signalDuration = getSignalDuration(size, maxRadius);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: signalDuration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [pulse, signalDuration]);

  const dotsPath = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    const points = buildDotMatrixPoints({ width: size.width, height: size.height, cellSize });
    const path = Skia.Path.Make();
    points.forEach((p) => path.addCircle(p.x, p.y, 2.5));
    return path;
  }, [size, cellSize]);

  const cx = size.width / 2;
  const cy = size.height * 0.45;
  const c = useDerivedValue(() => vec(cx, cy));
  const firstRadius = useSignalRadius(pulse, 0, maxRadius);
  const secondRadius = useSignalRadius(pulse, 0.34, maxRadius);
  const thirdRadius = useSignalRadius(pulse, 0.68, maxRadius);

  if (!dotsPath) return null;

  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      <Group>
        <SignalBand center={c} path={dotsPath} radius={firstRadius} />
        <SignalBand center={c} path={dotsPath} radius={secondRadius} />
        <SignalBand center={c} path={dotsPath} radius={thirdRadius} />
      </Group>
    </Canvas>
  );
}

function getOffscreenRadius(size: MeasuredSize): number {
  const yDistance = size.height * 0.55;
  const farthestCorner = Math.hypot(size.width / 2, yDistance);
  return (farthestCorner / RING_PEAK_POSITION) * OFFSCREEN_EXIT_MULTIPLIER;
}

function getSignalDuration(size: MeasuredSize, radius: number): number {
  const baselineRadius = Math.max(0.1, size.width * BASE_RADIUS_MULTIPLIER);
  return Math.round(SIGNAL_LOOP_MS * (radius / baselineRadius));
}

function useSignalRadius(
  pulse: SharedValue<number>,
  phase: number,
  maxRadius: number,
): DerivedValue<number> {
  return useDerivedValue(() => {
    const progress = (pulse.value + phase) % 1;
    return Math.max(0.1, progress * maxRadius);
  });
}

function SignalBand({
  center,
  path,
  radius,
}: {
  center: DerivedValue<Vector>;
  path: SkPath;
  radius: DerivedValue<number>;
}): React.ReactElement {
  return (
    <Path path={path}>
      <RadialGradient
        c={center}
        r={radius}
        colors={SIGNAL_COLORS}
        positions={SIGNAL_POSITIONS}
      />
    </Path>
  );
}


const styles = StyleSheet.create({
  webFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 167, 68, 0.04)',
  },
});
