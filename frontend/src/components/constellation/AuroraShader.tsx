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
 * Aurora SkSL fragment shader.
 *
 * Vertical curtains driven by 3-octave fractal Brownian motion (fBm), biased
 * upward so the brightest light pools toward the top of the frame and bleeds
 * downward through translucent brass and sage bands. The whole field drifts
 * horizontally at one rate and undulates vertically at another, which is what
 * gives real auroras their "curtain" feel.
 *
 *  - Time uniform drives both drifts.
 *  - Final color is `brass * brass_mask + sage * sage_mask + heat * deep_mask`,
 *    each masked by a different noise threshold so the colors don't grey out.
 *  - Vignette dims the bottom + edges so glass surfaces above retain contrast.
 *  - Output multiplied by 0.55 so it never out-shouts the foreground UI.
 */
const AURORA_SKSL = `
uniform float time;
uniform float2 resolution;

float hash(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(float2 p) {
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
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.05 + float2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / resolution;

  // Curtain coordinates — stretch vertically so bands feel like waterfalls
  float2 curtain = uv * float2(2.4, 1.0);

  // Two drifting noise fields combine into the curtain mask
  float n1 = fbm(curtain + float2(time * 0.045, time * 0.018));
  float n2 = fbm(curtain * 1.7 + float2(-time * 0.028, time * 0.04));
  float mask = clamp(n1 * 0.7 + n2 * 0.45, 0.0, 1.0);

  // Bias the brightness upward — auroras pool at the top of the sky
  float topBias = smoothstep(1.05, 0.0, uv.y);
  mask *= topBias;

  // Three masks for three colors, each peaks at a different noise level
  float brassMask = smoothstep(0.45, 0.85, mask);
  float sageMask = smoothstep(0.30, 0.70, mask) - brassMask * 0.5;
  float deepMask = smoothstep(0.10, 0.55, mask) - sageMask * 0.4;

  half3 brass = half3(0.851, 0.643, 0.255);
  half3 sage  = half3(0.616, 0.710, 0.643);
  half3 heat  = half3(1.000, 0.302, 0.180);
  half3 base  = half3(0.047, 0.122, 0.098);

  half3 col = base;
  col = mix(col, heat,  half(deepMask) * half(0.18));
  col = mix(col, sage,  half(sageMask) * half(0.32));
  col = mix(col, brass, half(brassMask) * half(0.45));

  // Edge vignette so the foreground glass keeps contrast
  float2 c = uv - 0.5;
  float r = length(c);
  float vignette = smoothstep(0.92, 0.30, r);
  col *= half(vignette);

  // Overall dim — never out-shout the UI
  return half4(col * half(0.55), 1.0);
}
`;

const effect = Skia.RuntimeEffect.Make(AURORA_SKSL);

interface AuroraShaderProps {
  /** Animation speed multiplier. 1 = standard, <1 = calmer, >1 = stormier. */
  speed?: number;
}

export function AuroraShader({ speed = 1 }: AuroraShaderProps) {
  const time = useSharedValue(0);

  useEffect(() => {
    // Long loop so floating-point precision never wraps within a session
    time.value = withRepeat(
      withTiming(180, { duration: 180_000 / speed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [speed, time]);

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
  fallback: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0C1F19' },
});
