import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface EndorserOrbProps {
  /** The endorser's Endorsement / Trust score, 0..100 */
  score: number;
  /** Number of confirmed hires they've delivered — these are permanent gold rays */
  hires: number;
  /** Active referrals in flight — these pulse cyan around the rim */
  active: number;
  size?: number;
  showLabel?: boolean;
}

/**
 * Endorsement Orb — the endorser's signature.
 *
 * A radial Skia visualization that visually encodes their reputation:
 *   - Central glowing core (Endorsement score brightness scales with score)
 *   - Permanent gold rays — one per confirmed hire, baked in forever
 *   - Pulsing cyan dots — one per active referral in their pipeline
 *   - Halo radius — reflects the score on a 0–1 curve
 *
 * Used on the endorser profile sheet and earnings dashboard. Replaces the
 * generic "47/100" text with something an endorser wants to screenshot.
 */
export function EndorserOrb({
  score,
  hires,
  active,
  size = 220,
  showLabel = true,
}: EndorserOrbProps) {
  const cx = size / 2;
  const cy = size / 2;
  const coreRadius = size * 0.16;
  const rayInner = size * 0.22;
  const rayOuter = size * 0.40;
  const activeOrbit = size * 0.46;
  const haloRadius = size * 0.32 + (score / 100) * size * 0.12;

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [pulse]);

  // Pre-compute hire ray angles (evenly distributed, capped at 24 visible)
  const hireRays = useMemo(() => {
    const visible = Math.min(hires, 24);
    return Array.from({ length: visible }).map((_, i) => (i / Math.max(visible, 1)) * Math.PI * 2);
  }, [hires]);

  const activeDots = useMemo(() => {
    const visible = Math.min(active, 12);
    return Array.from({ length: visible }).map((_, i) => {
      const angle = (i / Math.max(visible, 1)) * Math.PI * 2 + Math.PI / 12;
      return { x: cx + Math.cos(angle) * activeOrbit, y: cy + Math.sin(angle) * activeOrbit };
    });
  }, [active, cx, cy, activeOrbit]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Outer halo — score-modulated radius */}
        <Circle cx={cx} cy={cy} r={haloRadius} color="rgba(0, 255, 204, 0.10)">
          <BlurMask blur={28} style="solid" />
        </Circle>

        {/* Hire rays — permanent gold spokes */}
        <Group>
          {hireRays.map((angle, i) => (
            <Line
              key={`ray-${i}`}
              p1={vec(cx + Math.cos(angle) * rayInner, cy + Math.sin(angle) * rayInner)}
              p2={vec(cx + Math.cos(angle) * rayOuter, cy + Math.sin(angle) * rayOuter)}
              color="rgba(255, 196, 84, 0.95)"
              style="stroke"
              strokeWidth={2.4}
              strokeCap="round"
            >
              <BlurMask blur={2} style="solid" />
            </Line>
          ))}
        </Group>

        {/* Active referrals — cyan dots on the orbit, pulse via opacity */}
        <Group opacity={pulse}>
          {activeDots.map((d, i) => (
            <Circle key={`dot-${i}`} cx={d.x} cy={d.y} r={3} color="rgba(0, 255, 204, 0.95)">
              <BlurMask blur={3} style="solid" />
            </Circle>
          ))}
        </Group>

        {/* Core — the score itself, brightness scaled */}
        <Circle cx={cx} cy={cy} r={coreRadius * 1.6} color={`rgba(0, 255, 204, ${0.3 + (score / 100) * 0.4})`}>
          <BlurMask blur={14} style="solid" />
        </Circle>
        <Circle cx={cx} cy={cy} r={coreRadius} color="#FAFAF7" />
      </Canvas>

      {showLabel && (
        <View style={styles.labelOverlay} pointerEvents="none">
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.label}>ENDORSEMENT</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 30,
    color: '#0a0a0b',
    letterSpacing: -1,
  },
  label: {
    fontFamily: 'Outfit-Bold',
    fontSize: 8,
    color: 'rgba(10, 10, 11, 0.6)',  // dark navy on gold core

    letterSpacing: 2,
    marginTop: 2,
  },
});
