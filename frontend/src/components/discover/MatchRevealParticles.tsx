import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';

interface ParticleSpec {
  id: string;
  color: string;
  delay: number;
  duration: number;
  left: number;
  opacity: number;
  rotate: number;
  size: number;
  top: number;
  travelX: number;
  travelY: number;
}

const PARTICLE_COLORS = [colors.brass, colors.sage, 'rgba(244, 237, 221, 0.72)'];

export function ParticleField({ seed }: { seed: string }): React.ReactElement {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {buildParticles(seed).map((particle) => (
        <Particle key={particle.id} spec={particle} />
      ))}
    </View>
  );
}

function Particle({ spec }: { spec: ParticleSpec }): React.ReactElement {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withTiming(1, {
        duration: spec.duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, spec.delay, spec.duration]);

  const style = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * spec.opacity,
    transform: [
      { translateX: progress.value * spec.travelX },
      { translateY: -progress.value * spec.travelY },
      { scale: interpolate(progress.value, [0, 0.28, 1], [0.7, 1, 0.2]) },
      { rotate: `${progress.value * spec.rotate}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: spec.color,
          height: spec.size,
          left: `${spec.left}%`,
          top: `${spec.top}%`,
          width: spec.size,
        },
        style,
      ]}
    />
  );
}

function buildParticles(seed: string): ParticleSpec[] {
  const base = hash(seed);
  return Array.from({ length: 18 }, (_, index) => particleFrom(base, seed, index));
}

function particleFrom(base: number, seed: string, index: number): ParticleSpec {
  const n = hash(`${base}:${index}`);
  const dir = index % 2 === 0 ? -1 : 1;
  return {
    id: `${seed}-${index}`,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    delay: 130 + (n % 360),
    duration: 1200 + (n % 580),
    left: 10 + (n % 80),
    opacity: 0.3 + ((n % 45) / 100),
    rotate: dir * (80 + (n % 120)),
    size: 5 + (n % 7),
    top: 42 + (n % 42),
    travelX: dir * (16 + (n % 40)),
    travelY: 96 + (n % 160),
  };
}

function hash(value: string): number {
  let out = 0;
  for (let i = 0; i < value.length; i += 1) {
    out = (out * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(out);
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 99,
  },
});
