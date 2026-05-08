import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');
const PARTICLE_COUNT = 24;

interface Particle {
  angle: number;
  speed: number;
  size: number;
}

interface SwipeBurstProps {
  /** 0..1 driver. Animate from 0 to 1 to play the burst. */
  progress: SharedValue<number>;
  originX: number;
  originY: number;
  color?: string;
}

/**
 * Particle burst from a single origin point, driven by a 0..1 progress value.
 * Pre-bakes deterministic angles/speeds so the burst is reproducible per render.
 *
 * Caller is expected to:
 *   const progress = useSharedValue(0);
 *   progress.value = withTiming(1, { duration: 700 });  // play once
 *   <SwipeBurst progress={progress} originX={cx} originY={cy} />
 */
export function SwipeBurst({
  progress,
  originX,
  originY,
  color = 'rgba(0, 255, 204, 1)',
}: SwipeBurstProps) {
  const particles = useMemo<Particle[]>(() => {
    const out: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i * 0.137);
      const speed = 80 + ((i * 53) % 60); // 80..140 px
      const size = 2 + ((i * 7) % 4);     // 2..5 px
      out.push({ angle, speed, size });
    }
    return out;
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Group>
          {particles.map((p, i) => (
            <ParticleDot key={i} particle={p} progress={progress} ox={originX} oy={originY} color={color} />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

interface ParticleDotProps {
  particle: Particle;
  progress: SharedValue<number>;
  ox: number;
  oy: number;
  color: string;
}

function ParticleDot({ particle, progress, ox, oy, color }: ParticleDotProps) {
  // cx/cy expand outward as progress goes 0→1
  const cx = useDerivedValue(() => ox + Math.cos(particle.angle) * particle.speed * progress.value);
  const cy = useDerivedValue(() => oy + Math.sin(particle.angle) * particle.speed * progress.value);
  const radius = useDerivedValue(() => particle.size * (1 - progress.value * 0.6));
  const opacity = useDerivedValue(() => 1 - Easing.out(Easing.cubic)(progress.value));

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={radius} color={color} opacity={opacity}>
        <BlurMask blur={2} style="solid" />
      </Circle>
    </Group>
  );
}

/**
 * Convenience driver: returns a progress shared value and a `play()` function.
 */
export function useSwipeBurst(durationMs = 700) {
  const progress = useSharedValue(0);
  const play = () => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) });
  };
  return { progress, play };
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
});
