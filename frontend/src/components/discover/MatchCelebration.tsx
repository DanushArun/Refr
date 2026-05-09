import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Phrase } from '../../utils/haptics';

interface MatchCelebrationProps {
  /** When this prop changes from null to a number, the celebration fires once. */
  trigger: number | null;
  onComplete?: () => void;
}

const NAVY = '#0A1F44';
const GOLD = '#D4A744';
const GOLD_BRIGHT = '#FFD56A';
const CREAM = '#F5F1E8';

const TOTAL_MS = 1300;

/**
 * Endorsement Seal — premium, branded, *fast* match celebration.
 *
 * Three elements, three Animated.Views, zero Skia. Plays in ~1.3s but the
 * payoff lands by 280ms.
 *
 *   t=0…140ms    Flash bloom — gold radial pulse punches outward and dies
 *   t=60…320ms   Seal stamps in — navy/gold disc springs from scale 0 with a
 *                slight rotation, like a notary press hitting paper
 *   t=180…820ms  Wake ring — clean gold ring expands outward from the seal
 *                and fades, no fill — the shockwave from the stamp landing
 *   t=900…1300ms Fade — seal recedes
 *
 * Performance: 3 Animated.Views with native-driven transforms. No per-frame
 * worklet loops over 100 particles, no BlurMask. Replaces the previous
 * 100-particle Skia burst that was causing JS-thread lag on swipe.
 */
export function MatchCelebration({ trigger, onComplete }: MatchCelebrationProps) {
  // Master timer 0..1 over TOTAL_MS — drives flash, ring, and exit fade.
  const t = useSharedValue(0);
  // Seal entrance — independent spring so the stamp feels punchy + elastic.
  const sealEnter = useSharedValue(0);
  // 1 while the celebration is mounted; falls to 0 only at unmount.
  const visible = useSharedValue(0);

  const lastTrigger = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // OS-level Reduce Motion — respect it by playing a shorter, no-bounce variant.
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) setReduceMotion(enabled);
      },
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (trigger === null || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;

    Phrase.match();

    setActive(true);
    visible.value = 1;
    t.value = 0;
    sealEnter.value = 0;

    const duration = reduceMotion ? 700 : TOTAL_MS;
    t.value = withTiming(
      1,
      { duration, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          visible.value = 0;
          runOnJS(setActive)(false);
          if (onComplete) runOnJS(onComplete)();
        }
      },
    );

    if (reduceMotion) {
      sealEnter.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    } else {
      sealEnter.value = withDelay(
        60,
        withSpring(1, {
          damping: 9,
          stiffness: 220,
          mass: 0.7,
          overshootClamping: false,
        }),
      );
    }
  }, [trigger, onComplete, reduceMotion, t, sealEnter, visible]);

  // ─── Flash bloom ───
  // A bright gold disc that punches outward in the first ~140ms, then dies.
  const flashStyle = useAnimatedStyle(() => {
    const local = Math.min(1, t.value / 0.11);
    const scale = 0.4 + local * 5.6; // 0.4 → 6
    const opacity = (1 - local) * visible.value;
    return { opacity, transform: [{ scale }] };
  });

  // ─── Wake ring ───
  // Hollow gold ring expanding outward — the shockwave from the seal landing.
  const ringStyle = useAnimatedStyle(() => {
    const local = Math.max(0, Math.min(1, (t.value - 0.13) / 0.5));
    const scale = local * 7;
    const opacity = (1 - local) * 0.9 * visible.value;
    return { opacity, transform: [{ scale }] };
  });

  // ─── Seal stamp ───
  // Navy ring + gold disc + cream inner border + "ENDORSED" mark.
  // Springs in with elastic bounce, slight tilt that settles straight.
  const sealStyle = useAnimatedStyle(() => {
    const enter = sealEnter.value;
    // Tilt -8° → 0° as it lands
    const rotate = (1 - Math.min(1, enter)) * -8;
    const enterOpacity = Math.min(1, enter * 2);
    // Late fade-out so the seal recedes gracefully
    const exitT = Math.max(0, (t.value - 0.72) / 0.28);
    const exitOpacity = 1 - exitT;
    const exitScale = 1 - exitT * 0.06;
    return {
      opacity: enterOpacity * exitOpacity * visible.value,
      transform: [
        { scale: enter * exitScale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  if (!active) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.flash, flashStyle]} />

      <Animated.View style={[styles.ring, ringStyle]} />

      <Animated.View style={[styles.sealWrap, sealStyle]}>
        <View style={styles.sealOuter}>
          <View style={styles.sealInner}>
            <Text style={styles.sealMark}>★</Text>
            <Text style={styles.sealLabel}>ENDORSED</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const SEAL = 156;
const SEAL_INNER = 132;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: GOLD_BRIGHT,
    // Soft halo on iOS (Android falls back to elevation glow)
    shadowColor: GOLD_BRIGHT,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 24,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: GOLD_BRIGHT,
    backgroundColor: 'transparent',
  },
  sealWrap: {
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 22,
  },
  sealOuter: {
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: SEAL_INNER,
    height: SEAL_INNER,
    borderRadius: SEAL_INNER / 2,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CREAM,
    gap: 2,
  },
  sealMark: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 38,
    lineHeight: 40,
    color: NAVY,
  },
  sealLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    letterSpacing: 2.5,
    color: NAVY,
  },
});
