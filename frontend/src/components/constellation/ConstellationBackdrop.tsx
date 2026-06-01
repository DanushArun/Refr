import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Transforms3d } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { type GalaxyData } from '../../lib/constellation/buildGalaxy';
import { useDeviceTilt } from '../../hooks/useDeviceTilt';
import { ConstellationCanvas } from './ConstellationBackdropLayers';
import { getDemoGalaxy } from './demoGalaxy';

interface Props {
  active?: boolean;
  alive?: boolean;
  galaxy?: GalaxyData;
  parallaxStrength?: number;
  visible?: boolean;
}

export function ConstellationBackdrop({
  active = true,
  alive = true,
  galaxy,
  parallaxStrength = 24,
  visible = true,
}: Props): React.ReactElement | null {
  const data = useMemo(() => galaxy ?? getDemoGalaxy(), [galaxy]);
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(visible ? 1 : 0);
  const [shouldRender, setShouldRender] = useState(visible);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tiltX, tiltY } = useDeviceTilt(active && shouldRender);

  useRenderWindow({ setShouldRender, shouldRender, timerRef: fadeOutTimerRef, visible });
  usePulseLoop({ active, alive, pulse, shouldRender });
  useFadeVisibility({ opacity, visible });

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const transforms = useParallaxTransforms({ parallaxStrength, tiltX, tiltY });

  if (!shouldRender) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, fadeStyle]} pointerEvents="none">
        <ConstellationCanvas
          backTransform={transforms.backTransform}
          data={data}
          frontTransform={transforms.frontTransform}
          midTransform={transforms.midTransform}
          parallaxStrength={parallaxStrength}
          pulse={pulse}
          tiltX={tiltX}
          tiltY={tiltY}
        />
      </Animated.View>
    </View>
  );
}

function useRenderWindow({
  setShouldRender,
  shouldRender,
  timerRef,
  visible,
}: {
  setShouldRender: (value: boolean) => void;
  shouldRender: boolean;
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  visible: boolean;
}): void {
  useEffect(() => {
    if (visible) {
      clearUnmountTimer(timerRef);
      setShouldRender(true);
    } else if (shouldRender) {
      timerRef.current = setTimeout(() => {
        setShouldRender(false);
        timerRef.current = null;
      }, 650);
    }
    return () => clearUnmountTimer(timerRef);
  }, [setShouldRender, shouldRender, timerRef, visible]);
}

function usePulseLoop({
  active,
  alive,
  pulse,
  shouldRender,
}: {
  active: boolean;
  alive: boolean;
  pulse: SharedValue<number>;
  shouldRender: boolean;
}): void {
  useEffect(() => {
    if (!alive || !shouldRender || !active) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.96, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [active, alive, pulse, shouldRender]);
}

function useFadeVisibility({
  opacity,
  visible,
}: {
  opacity: SharedValue<number>;
  visible: boolean;
}): void {
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 1200 : 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [opacity, visible]);
}

function useParallaxTransforms({
  parallaxStrength,
  tiltX,
  tiltY,
}: {
  parallaxStrength: number;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}) {
  const backTransform = useDerivedValue<Transforms3d>(() => [
    { translateX: tiltX.value * parallaxStrength * 0.3 },
    { translateY: tiltY.value * parallaxStrength * 0.3 },
  ]);
  const midTransform = useDerivedValue<Transforms3d>(() => [
    { translateX: tiltX.value * parallaxStrength * 0.7 },
    { translateY: tiltY.value * parallaxStrength * 0.7 },
  ]);
  const frontTransform = useDerivedValue<Transforms3d>(() => [
    { translateX: tiltX.value * parallaxStrength * 1.2 },
    { translateY: tiltY.value * parallaxStrength * 1.2 },
  ]);

  return { backTransform, frontTransform, midTransform };
}

function clearUnmountTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
): void {
  if (!timerRef.current) return;
  clearTimeout(timerRef.current);
  timerRef.current = null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
