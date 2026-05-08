import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

export function AmbientBackground() {
  // Orb 1: violet — top-left, breathing radius
  const r1 = useSharedValue(140);

  // Orb 2: cyan — bottom-right, drifting horizontally
  const x2 = useSharedValue(W * 0.82);
  const r2 = useSharedValue(115);

  // Orb 3: teal — center, opposite phase breath
  const r3 = useSharedValue(90);

  useEffect(() => {
    r1.value = withRepeat(
      withSequence(
        withTiming(172, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(140, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    x2.value = withRepeat(
      withSequence(
        withTiming(W * 0.68, { duration: 22000, easing: Easing.inOut(Easing.quad) }),
        withTiming(W * 0.88, { duration: 22000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    r2.value = withRepeat(
      withSequence(
        withTiming(138, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        withTiming(110, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    r3.value = withRepeat(
      withSequence(
        withTiming(72, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(108, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Violet orb — top-left quadrant */}
        <Circle cx={W * 0.22} cy={H * 0.17} r={r1} color="rgba(124, 58, 237, 0.20)">
          <BlurMask blur={70} style="normal" />
        </Circle>

        {/* Cyan orb — bottom-right, drifts */}
        <Circle cx={x2} cy={H * 0.77} r={r2} color="rgba(0, 255, 204, 0.13)">
          <BlurMask blur={75} style="normal" />
        </Circle>

        {/* Teal orb — center mass, very subtle */}
        <Circle cx={W * 0.55} cy={H * 0.52} r={r3} color="rgba(6, 182, 212, 0.07)">
          <BlurMask blur={90} style="normal" />
        </Circle>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
