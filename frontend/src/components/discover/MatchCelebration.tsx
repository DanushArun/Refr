import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { afterHoursBrand, afterHoursDetonations } from '../../theme/afterHours';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Phrase } from '../../utils/haptics';

interface MatchCelebrationProps {
  trigger: number | null;
  label?: string;
  onComplete?: () => void;
}

const TOTAL_MS = 1420;

function headlineFor(label: string): string {
  if (label.toUpperCase() === 'ACCEPTED') {
    return afterHoursDetonations.matchAccepted.headline;
  }
  return 'Request sent.';
}

function eyebrowFor(label: string): string {
  if (label.toUpperCase() === 'ACCEPTED') return 'ENDORSEMENT ACCEPTED';
  return label.toUpperCase();
}

function reportReduceMotionError(error: unknown): void {
  if (__DEV__) {
    console.warn('Unable to read reduce motion preference', error);
  }
}

export function MatchCelebration({
  trigger,
  label = 'REQUESTED',
  onComplete,
}: MatchCelebrationProps) {
  const progress = useSharedValue(0);
  const lastTrigger = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(reportReduceMotionError);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
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
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: reduceMotion ? 760 : TOTAL_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (!finished) return;
        runOnJS(setActive)(false);
        if (onComplete) runOnJS(onComplete)();
      },
    );
  }, [trigger, onComplete, progress, reduceMotion]);

  const shellStyle = useAnimatedStyle(() => {
    const exit = Math.max(0, (progress.value - 0.76) / 0.24);
    return {
      opacity: 1 - exit,
      transform: [{ scale: 1 + exit * 0.04 }],
    };
  });

  const copyStyle = useAnimatedStyle(() => {
    const enter = Math.min(1, progress.value / 0.18);
    const exit = Math.max(0, (progress.value - 0.7) / 0.3);
    return {
      opacity: enter * (1 - exit),
      transform: [{ translateY: (1 - enter) * 18 - exit * 8 }],
    };
  });

  if (!active) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, shellStyle]}>
      <LinearGradient
        colors={afterHoursBrand.fills.vermilionDetonation}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.textureTop} />
      <View style={styles.textureBottom} />
      <Animated.View style={[styles.copy, copyStyle]}>
        <Text style={styles.eyebrow}>{eyebrowFor(label)}</Text>
        <Text adjustsFontSizeToFit numberOfLines={2} style={styles.headline}>
          {headlineFor(label)}
        </Text>
        <View style={styles.actionPlate}>
          <Text style={styles.actionText}>
            {afterHoursDetonations.matchAccepted.actionLabel}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  textureTop: {
    position: 'absolute',
    top: -96,
    right: -72,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(244, 237, 221, 0.14)',
  },
  textureBottom: {
    position: 'absolute',
    bottom: -120,
    left: -84,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(12, 31, 25, 0.18)',
  },
  copy: {
    width: '100%',
    paddingHorizontal: spacing[8],
    alignItems: 'center',
    gap: spacing[5],
  },
  eyebrow: {
    ...typography.sectionEyebrow,
    color: colors.navyDeep,
  },
  headline: {
    ...typography.detonationDisplay,
    maxWidth: 320,
    color: colors.navyDeep,
    textAlign: 'center',
  },
  actionPlate: {
    minHeight: 48,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.navyDeep,
  },
  actionText: {
    ...typography.buttonLabel,
    color: colors.cream,
  },
});
