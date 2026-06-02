import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Canvas, Circle, Group, Mask, Path, Skia } from '@shopify/react-native-skia';
import { Phrase } from '../../utils/haptics';
import { buildDotMatrixPoints } from '../../lib/visual/dotMatrix';

interface MatchCelebrationProps {
  /** When this prop changes from null to a number, the celebration fires once. */
  trigger: number | null;
  /** Seal label — "REQUESTED" for seeker side, "ACCEPTED" for endorser side. */
  label?: string;
  onComplete?: () => void;
}

const NAVY = '#0A1F44';
const GOLD = '#D4A744';
const GOLD_BRIGHT = '#FFD56A';
const CREAM = '#F5F1E8';

const TOTAL_MS = 1300;

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');
const CX = WIN_W / 2;
const CY = WIN_H / 2;

export function MatchCelebration({
  trigger,
  label = 'REQUESTED',
  onComplete,
}: MatchCelebrationProps) {
  const t = useSharedValue(0);
  const sealEnter = useSharedValue(0);
  const visible = useSharedValue(0);

  const lastTrigger = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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

  // Dot matrix background base
  const dotsPath = useMemo(() => {
    const points = buildDotMatrixPoints({ width: WIN_W, height: WIN_H, cellSize: 16 });
    const path = Skia.Path.Make();
    points.forEach((p) => path.addCircle(p.x, p.y, 2));
    return path;
  }, []);

  // Wind wave path (scattered dots near center to simulate wind particles)
  const windDotsPath = useMemo(() => {
    const w = WIN_W * 0.8;
    const h = WIN_H * 0.5;
    const points = buildDotMatrixPoints({ width: w, height: h, cellSize: 12 });
    const path = Skia.Path.Make();
    const offsetX = (WIN_W - w) / 2;
    const offsetY = (WIN_H - h) / 2;
    
    // Seeded randomness for stable render
    let seed = 1;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    points.forEach((p) => {
      const px = p.x + offsetX;
      const py = p.y + offsetY;
      if (random() > 0.4) {
        path.addCircle(px, py, 1.2 + random());
      }
    });
    return path;
  }, []);

  // ─── Flash bloom (Dot Matrix) ───
  const flashR = useDerivedValue(() => {
    const local = Math.min(1, t.value / 0.11);
    return local * (WIN_W * 0.8);
  });
  const flashOpacity = useDerivedValue(() => {
    const local = Math.min(1, t.value / 0.11);
    return (1 - local) * visible.value;
  });

  // ─── Wake ring (Dot Matrix) ───
  const ringR = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (t.value - 0.13) / 0.5));
    return local * WIN_W;
  });
  const ringOpacity = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (t.value - 0.13) / 0.5));
    return (1 - local) * 0.9 * visible.value;
  });

  // ─── Wind Wave (Dot Matrix) ───
  // Translates rightwards quickly and fades out
  const windTranslate = useDerivedValue(() => {
    const local = Easing.out(Easing.cubic)(Math.min(1, t.value / 0.35));
    return [{ translateX: local * (WIN_W * 1.2) }];
  });
  const windOpacity = useDerivedValue(() => {
    const local = Math.min(1, t.value / 0.5);
    return (1 - local) * visible.value * 0.85;
  });

  // ─── Seal stamp ───
  const sealStyle = useAnimatedStyle(() => {
    const enter = sealEnter.value;
    const rotate = (1 - Math.min(1, enter)) * -8;
    const enterOpacity = Math.min(1, enter * 2);
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
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Flash Burst */}
        <Group opacity={flashOpacity}>
          <Mask mask={<Circle cx={CX} cy={CY} r={flashR} color="white" />}>
            <Path path={dotsPath} color={GOLD_BRIGHT} />
          </Mask>
        </Group>
        
        {/* Expanding Wake Ring */}
        <Group opacity={ringOpacity}>
          <Mask mask={<Circle cx={CX} cy={CY} r={ringR} color="white" style="stroke" strokeWidth={32} />}>
            <Path path={dotsPath} color={GOLD_BRIGHT} />
          </Mask>
        </Group>

        {/* Wind Trail */}
        <Group transform={windTranslate} opacity={windOpacity}>
          <Path path={windDotsPath} color={GOLD_BRIGHT} />
        </Group>
      </Canvas>

      <Animated.View style={[styles.sealWrap, sealStyle]}>
        <View style={styles.sealOuter}>
          <View style={styles.sealInner}>
            <Text style={styles.sealMark}>★</Text>
            <Text style={styles.sealLabel}>{label}</Text>
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
