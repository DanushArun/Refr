import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Ambient orbs for the app backdrop — three large soft glows that breathe
 * continuously.
 *
 * Performance: previously this animated each orb's RADIUS via `withRepeat`,
 * which forced Skia to recompute three full-screen Gaussian blurs (blur=70-90)
 * every frame. The orbs now have static geometry; only their `opacity` is
 * animated. Skia caches the blurred shape once and only re-composites with the
 * new alpha each frame — a cheap pixel-shader pass instead of a fresh blur.
 * Same visible "breathing" effect, a fraction of the GPU cost.
 */
export function AmbientBackground() {
  const opacity1 = useSharedValue(0.85);
  const opacity2 = useSharedValue(0.9);
  const opacity3 = useSharedValue(0.8);

  useEffect(() => {
    opacity1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.7, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    opacity2.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    opacity3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [opacity1, opacity2, opacity3]);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Circle
          cx={W * 0.22}
          cy={H * 0.17}
          r={150}
          color="rgba(124, 58, 237, 0.20)"
          opacity={opacity1}
        >
          <BlurMask blur={70} style="normal" />
        </Circle>
        <Circle
          cx={W * 0.82}
          cy={H * 0.77}
          r={120}
          color="rgba(0, 255, 204, 0.13)"
          opacity={opacity2}
        >
          <BlurMask blur={75} style="normal" />
        </Circle>
        <Circle
          cx={W * 0.55}
          cy={H * 0.52}
          r={92}
          color="rgba(6, 182, 212, 0.07)"
          opacity={opacity3}
        >
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
