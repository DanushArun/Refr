import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

/**
 * GPU fragment shader that paints a slow-evolving deep-space nebula.
 * Pure SkSL — runs on the GPU at 120fps, never touches the JS thread.
 *
 * Layered fractal noise across three octaves, blended into a violet→cyan→deep-blue
 * gradient that drifts with `time`. Multiplied by a soft radial vignette so the
 * frame edges fade into the app background.
 */
const NEBULA_SKSL = `
uniform float time;
uniform float2 resolution;

// 2D hash for procedural noise
float hash(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.1 + float2(time * 0.04, time * 0.03);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / resolution;
  float2 p = uv * 2.4;
  // Two layered noise fields for depth
  float n1 = fbm(p);
  float n2 = fbm(p * 1.7 + float2(5.2, 1.3));
  float cloud = clamp(n1 * 0.7 + n2 * 0.5, 0.0, 1.0);

  // Color palette: violet → cyan → deep navy
  half3 violet = half3(0.486, 0.227, 0.929);
  half3 cyan   = half3(0.0,   1.0,   0.8);
  half3 navy   = half3(0.039, 0.039, 0.043);

  half3 col = mix(navy, violet, half(cloud) * half(0.55));
  col = mix(col, cyan, half(cloud * cloud) * half(0.18));

  // Radial vignette so edges fade into the app's solid background
  float2 c = uv - 0.5;
  float r = length(c);
  float vignette = smoothstep(0.85, 0.30, r);
  col *= half(vignette);

  // Final tone — kept dim so glass and stars dominate
  return half4(col * half(0.55), 1.0);
}
`;

const effect = Skia.RuntimeEffect.Make(NEBULA_SKSL);

interface NebulaShaderProps {
  speed?: number;
}

export function NebulaShader({ speed = 1 }: NebulaShaderProps) {
  const time = useSharedValue(0);

  useEffect(() => {
    // Continuous time uniform, looped over a long period to avoid float drift
    time.value = withRepeat(
      withTiming(120, { duration: 120000 / speed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [speed, time]);

  // Skia uniforms must come through as a single derived object
  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [W, H],
  }));

  if (!effect) {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={styles.canvas} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Fill>
          <Shader source={effect} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { ...StyleSheet.absoluteFillObject },
  fallback: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0A0A0B' },
});
