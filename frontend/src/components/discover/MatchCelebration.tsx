import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
} from '@shopify/react-native-skia';
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Phrase } from '../../utils/haptics';

const { width: W, height: H } = Dimensions.get('window');

interface MatchCelebrationProps {
  /** When this prop changes from null to a number, the celebration fires once. */
  trigger: number | null;
  /** Origin point for the burst. Defaults to screen center. */
  originX?: number;
  originY?: number;
  onComplete?: () => void;
}

interface Particle {
  angle: number;
  speed: number;
  size: number;
  layer: 0 | 1 | 2;
  driftX: number;
  spin: number;
  ttl: number; // 0..1, how long it lives within the 1.4s envelope
}

const COLORS = [
  '#FFD56A', // bright gold (peak)
  '#E8BD58', // sailor gold
  '#D4A744', // brand accent gold
  '#F5F1E8', // cream
  '#FFFFFF', // pure white spark
];

/**
 * Match celebration — a 100-particle Skia burst that fires on right-swipe
 * commit. The single biggest emotional payoff in the app.
 *
 * Three particle layers:
 *   Layer 0 (40 particles) — large sparks, slow, gold (the headline)
 *   Layer 1 (35 particles) — medium gold + cream confetti
 *   Layer 2 (25 particles) — fast pure-white pinpricks
 *
 * Each particle has a deterministic trajectory (angle + speed + drift +
 * gravity), so the burst is reproducible per render but feels organic.
 *
 * Lifecycle ~1400ms total:
 *   t=0–80ms      crown blooms (fast outward, full opacity)
 *   t=80–600ms    particles arc, gravity engages
 *   t=600–1400ms  fade + decay
 */
export function MatchCelebration({
  trigger,
  originX = W / 2,
  originY = H * 0.42,
  onComplete,
}: MatchCelebrationProps) {
  const t = useSharedValue(0);
  const visible = useSharedValue(0);

  const lastTrigger = useRef<number | null>(null);
  // Keep the heavy Skia tree mounted only while the burst is animating.
  // Stops the canvas from rendering anything (incl. zero-radius circles
  // and 60px halos at 0 opacity) while idle — those were producing visual
  // artifacts on some renderers.
  const [active, setActive] = useState(false);

  const particles = useMemo<Particle[]>(() => buildParticles(), []);

  useEffect(() => {
    if (trigger === null || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    // The full musical match cadence runs in parallel
    Phrase.match();

    setActive(true);
    visible.value = 1;
    t.value = 0;
    t.value = withTiming(
      1,
      { duration: 1400, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          visible.value = 0;
          runOnJS(setActive)(false);
          if (onComplete) runOnJS(onComplete)();
        }
      },
    );
  }, [trigger, onComplete, t, visible]);

  if (!active) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Crown bloom — a single bright halo at origin that pulses out and dies */}
        <CrownBloom t={t} ox={originX} oy={originY} visible={visible} />

        {/* Three particle layers, ordered back-to-front */}
        <Group>
          {particles
            .filter((p) => p.layer === 0)
            .map((p, i) => (
              <ParticleDot
                key={`l0-${i}`}
                particle={p}
                t={t}
                visible={visible}
                originX={originX}
                originY={originY}
                blur={4}
              />
            ))}
        </Group>
        <Group>
          {particles
            .filter((p) => p.layer === 1)
            .map((p, i) => (
              <ParticleDot
                key={`l1-${i}`}
                particle={p}
                t={t}
                visible={visible}
                originX={originX}
                originY={originY}
                blur={2}
              />
            ))}
        </Group>
        <Group>
          {particles
            .filter((p) => p.layer === 2)
            .map((p, i) => (
              <ParticleDot
                key={`l2-${i}`}
                particle={p}
                t={t}
                visible={visible}
                originX={originX}
                originY={originY}
                blur={1}
              />
            ))}
        </Group>
      </Canvas>
    </View>
  );
}

interface DotProps {
  particle: Particle;
  t: SharedValue<number>;
  visible: SharedValue<number>;
  originX: number;
  originY: number;
  blur: number;
}

function ParticleDot({ particle, t, visible, originX, originY, blur }: DotProps) {
  const color = COLORS[(particle.layer * 7 + Math.round(particle.angle * 7)) % COLORS.length];

  const cx = useDerivedValue(() => {
    const localT = Math.min(1, t.value / particle.ttl);
    const drift = particle.driftX * localT;
    return originX + Math.cos(particle.angle) * particle.speed * localT + drift;
  });
  const cy = useDerivedValue(() => {
    const localT = Math.min(1, t.value / particle.ttl);
    // Gravity term (px/sec²) integrates as t² — feels like real falling sparks
    const gravity = 380 * localT * localT;
    return originY + Math.sin(particle.angle) * particle.speed * localT + gravity;
  });
  const radius = useDerivedValue(() => {
    const localT = Math.min(1, t.value / particle.ttl);
    // Particles bloom in the first 12% of life, then shrink
    const grow = Math.min(1, localT / 0.12);
    const shrink = 1 - localT * 0.7;
    return particle.size * grow * shrink * visible.value;
  });
  const opacity = useDerivedValue(() => {
    const localT = Math.min(1, t.value / particle.ttl);
    // Hold full opacity through 70%, then ease out
    if (localT < 0.7) return visible.value;
    const fade = 1 - (localT - 0.7) / 0.3;
    return Math.max(0, fade) * visible.value;
  });

  return (
    <Circle cx={cx} cy={cy} r={radius} color={color} opacity={opacity}>
      <BlurMask blur={blur} style="solid" />
    </Circle>
  );
}

function CrownBloom({
  t,
  ox,
  oy,
  visible,
}: {
  t: SharedValue<number>;
  ox: number;
  oy: number;
  visible: SharedValue<number>;
}) {
  // A wide, soft halo that snaps out in the first ~120ms and fades.
  const r = useDerivedValue(() => {
    const k = Math.min(1, t.value / 0.12);
    return 60 + k * 180;
  });
  const opacity = useDerivedValue(() => {
    if (t.value < 0.12) return 0.55 * visible.value;
    const fade = 1 - (t.value - 0.12) / 0.45;
    return Math.max(0, fade) * 0.55 * visible.value;
  });

  return (
    <Circle cx={ox} cy={oy} r={r} color="rgba(232, 189, 88, 0.55)" opacity={opacity}>
      <BlurMask blur={36} style="solid" />
    </Circle>
  );
}

function buildParticles(): Particle[] {
  const out: Particle[] = [];

  // Layer 0 — big slow gold sparks (40)
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2 + (i * 0.131);
    out.push({
      angle,
      speed: 90 + ((i * 19) % 50),  // 90..140
      size: 4 + ((i * 5) % 3),       // 4..6
      layer: 0,
      driftX: ((i * 11) % 30) - 15,  // ±15
      spin: 0,
      ttl: 0.85 + ((i * 3) % 15) / 100,  // 0.85..1.0
    });
  }

  // Layer 1 — medium gold + cream confetti (35)
  for (let i = 0; i < 35; i++) {
    const angle = (i / 35) * Math.PI * 2 + (i * 0.218) + Math.PI / 6;
    out.push({
      angle,
      speed: 130 + ((i * 23) % 80),  // 130..210
      size: 2.5 + ((i * 7) % 3) * 0.4,
      layer: 1,
      driftX: ((i * 17) % 40) - 20,
      spin: 0,
      ttl: 0.65 + ((i * 5) % 25) / 100,
    });
  }

  // Layer 2 — fast white pinpricks (25)
  for (let i = 0; i < 25; i++) {
    const angle = (i / 25) * Math.PI * 2 + (i * 0.31);
    out.push({
      angle,
      speed: 200 + ((i * 31) % 120),  // 200..320
      size: 1.5 + ((i * 3) % 2) * 0.3,
      layer: 2,
      driftX: 0,
      spin: 0,
      ttl: 0.45 + ((i * 7) % 25) / 100,
    });
  }

  return out;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
});
