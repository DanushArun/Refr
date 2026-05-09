import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
} from '@shopify/react-native-skia';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;

// Drag must travel a few px before the reaction begins to fade in. Avoids
// flickering on accidental nudges and gives the gesture room to breathe.
const REVEAL_AT = WINDOW_WIDTH * 0.04;

const SEAL_SIZE = 152;

interface StampProps {
  translateX: SharedValue<number>;
  kind: 'request' | 'pass';
  /** Right-swipe seal text. "REQUEST" for seeker side, "ACCEPT" for endorser
   *  side. Defaults to REQUEST. */
  commitLabel?: string;
}

/**
 * Swipe reaction overlay.
 *
 *   `kind="request"` (right swipe) — a celebratory gold sailor's wax seal
 *   that scales up with drag. Reads REQUEST in editorial serif. (On the
 *   seeker side, swiping right SENDS a request — endorsement is what the
 *   referrer does, not what the seeker does.) No red, no judgmental fanfare
 *   — just a beautiful, addictive moment of "yes".
 *
 *   `kind="pass"` (left swipe) — a quiet cream wisp that fades in and
 *   drifts off-screen with the card. No stamp, no harshness, no shame.
 *   "Pass" is a valid action; we never want the user to feel rejected
 *   for using their own filter.
 *
 * Both render absolutely above the card and are pointerEvents="none".
 */
export function SwipeStamp({ translateX, kind, commitLabel = 'REQUEST' }: StampProps) {
  if (kind === 'request') return <RequestSeal translateX={translateX} label={commitLabel} />;
  return <PassWisp translateX={translateX} />;
}

function RequestSeal({
  translateX,
  label,
}: {
  translateX: SharedValue<number>;
  label: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [REVEAL_AT, COMMIT_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    // Pop slightly past 1.0 right at the commit moment for a "punch" feel
    const scale = interpolate(
      translateX.value,
      [REVEAL_AT, COMMIT_THRESHOLD, COMMIT_THRESHOLD * 1.4],
      [0.55, 1.0, 1.08],
      Extrapolation.CLAMP,
    );
    // Subtle stamp-rotation that softens as the user fully commits
    const rotate = interpolate(
      translateX.value,
      [0, COMMIT_THRESHOLD],
      [-14, -6],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.sealContainer, animStyle]}>
      {/* Gold halo + disc rendered in Skia so the glow stays smooth on the GPU */}
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Group>
          {/* Outer halo — soft sailor gold bloom */}
          <Circle
            cx={SEAL_SIZE / 2}
            cy={SEAL_SIZE / 2}
            r={SEAL_SIZE / 2 * 0.96}
            color="rgba(232, 189, 88, 0.48)"
          >
            <BlurMask blur={28} style="solid" />
          </Circle>
          {/* Mid glow */}
          <Circle
            cx={SEAL_SIZE / 2}
            cy={SEAL_SIZE / 2}
            r={SEAL_SIZE / 2 * 0.78}
            color="rgba(232, 189, 88, 0.55)"
          >
            <BlurMask blur={12} style="solid" />
          </Circle>
          {/* Inner gold disc — the seal itself */}
          <Circle
            cx={SEAL_SIZE / 2}
            cy={SEAL_SIZE / 2}
            r={SEAL_SIZE / 2 * 0.62}
            color="#D4A744"
          />
          {/* Highlight rim — light catches the top of a real wax seal */}
          <Circle
            cx={SEAL_SIZE / 2}
            cy={SEAL_SIZE / 2 - 6}
            r={SEAL_SIZE / 2 * 0.62}
            color="rgba(255, 240, 200, 0.35)"
          >
            <BlurMask blur={6} style="solid" />
          </Circle>
        </Group>
      </Canvas>
      <View style={styles.sealLabel}>
        <Text style={styles.sealMark}>✦</Text>
        <Text style={styles.sealText}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function PassWisp({ translateX }: { translateX: SharedValue<number> }) {
  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-COMMIT_THRESHOLD, -REVEAL_AT],
      [1, 0],
      Extrapolation.CLAMP,
    );
    // Wisp drifts further left as the user commits — accentuates the "release"
    const tx = interpolate(
      translateX.value,
      [-COMMIT_THRESHOLD * 1.4, 0],
      [-22, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateX: tx }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.wispContainer, animStyle]}>
      <Text style={styles.wispMark}>~</Text>
      <Text style={styles.wispText}>pass</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* Right — celebratory gold seal in the upper-right of the brand zone */
  sealContainer: {
    position: 'absolute',
    top: 56,
    right: 28,
    width: SEAL_SIZE,
    height: SEAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  sealLabel: {
    alignItems: 'center',
    gap: 2,
  },
  sealMark: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 22,
    color: '#0A1F44',
    marginBottom: -4,
  },
  sealText: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 24,
    color: '#0A1F44',
    letterSpacing: 2,
  },

  /* Left — gentle cream wisp in the upper-left of the brand zone */
  wispContainer: {
    position: 'absolute',
    top: 72,
    left: 32,
    alignItems: 'flex-start',
    zIndex: 12,
  },
  wispMark: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 40,
    color: 'rgba(245, 241, 232, 0.55)',
    letterSpacing: 6,
    marginBottom: -10,
  },
  wispText: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 30,
    color: 'rgba(245, 241, 232, 0.85)',
    letterSpacing: 2,
  },
});
