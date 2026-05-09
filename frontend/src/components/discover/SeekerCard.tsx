import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../common/Avatar';
import { MatchArc } from './MatchArc';
import { brandForName } from './companyBrand';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { SwipeStamp } from './SwipeStamp';
import type {
  EntryFrom,
  SwipeCommand,
  SwipeDirection,
} from './SwipeDeck';
import type { SeekerCard as SeekerCardData } from './seekerCardData';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.4;
const SWIPE_OUT_MS = 220;
const ENTRY_IN_MS = 320;
const CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.62));
const MAX_DRIFT_Y = 90;
const BACK_RISE_TRANSLATE_Y = 8;
const BACK_RISE_SCALE = 0.025;

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_50 = 'rgba(0, 0, 0, 0.50)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

interface SeekerCardProps {
  card: SeekerCardData;
  isTop: boolean;
  stackIndex: number;
  headProgress: SharedValue<number>;
  entryFrom: EntryFrom;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
  registerSwipe?: (cmd: SwipeCommand) => void;
}

export function SeekerCard({
  card,
  isTop,
  stackIndex,
  headProgress,
  entryFrom,
  onSwiped,
  onTap,
  registerSwipe,
}: SeekerCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const stampPlayed = useSharedValue(0);
  const stackValue = useSharedValue(stackIndex);
  const isFlyingRef = useRef(false);

  const playRequest = useCallback(() => Phrase.swipeRequest(), []);
  const playPass = useCallback(() => Phrase.swipePass(), []);
  const playStampReveal = useCallback(() => Phrase.stampReveal(), []);
  const playReleaseTick = useCallback(() => Phrase.tick(), []);

  const onSwipedRef = useRef(onSwiped);
  onSwipedRef.current = onSwiped;
  const finishSwipe = useCallback(
    (direction: SwipeDirection) => onSwipedRef.current(direction),
    [],
  );

  const flyOff = useCallback(
    (direction: SwipeDirection) => {
      isFlyingRef.current = true;
      const target = direction === 'request' ? FLY_OFF_X : -FLY_OFF_X;
      if (direction === 'request') playRequest();
      else playPass();
      const exitDriftY = translateY.value + 28;
      translateX.value = withTiming(
        target,
        { duration: SWIPE_OUT_MS, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) runOnJS(finishSwipe)(direction);
        },
      );
      translateY.value = withTiming(exitDriftY, { duration: SWIPE_OUT_MS });
      headProgress.value = withTiming(direction === 'request' ? 1 : -1, {
        duration: SWIPE_OUT_MS / 2,
      });
    },
    [translateX, translateY, headProgress, playRequest, playPass, finishSwipe],
  );

  const handleTap = useCallback(() => {
    if (isFlyingRef.current) return;
    if (onTap) onTap();
  }, [onTap]);

  useEffect(() => {
    if (!isTop || !registerSwipe) return;
    registerSwipe((direction) => flyOff(direction));
  }, [isTop, registerSwipe, flyOff]);

  useEffect(() => {
    stackValue.value = withSpring(stackIndex, {
      damping: 22,
      stiffness: 180,
      mass: 0.9,
    });
  }, [stackIndex, stackValue]);

  useEffect(() => {
    if (!isTop || !entryFrom) return;
    const startX = entryFrom === 'right' ? FLY_OFF_X : -FLY_OFF_X;
    translateX.value = startX;
    translateY.value = 24;
    headProgress.value = entryFrom === 'right' ? 1 : -1;
    translateX.value = withTiming(0, {
      duration: ENTRY_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: ENTRY_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    headProgress.value = withTiming(0, {
      duration: ENTRY_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [isTop, entryFrom, translateX, translateY, headProgress]);

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      const dy = e.translationY;
      translateY.value = MAX_DRIFT_Y * Math.tanh(dy / MAX_DRIFT_Y);
      const p = e.translationX / COMMIT_THRESHOLD;
      headProgress.value = p > 1 ? 1 : p < -1 ? -1 : p;
      const past = Math.abs(e.translationX) > COMMIT_THRESHOLD * 0.6;
      if (past && stampPlayed.value === 0) {
        stampPlayed.value = 1;
        runOnJS(playStampReveal)();
      } else if (!past && stampPlayed.value === 1) {
        stampPlayed.value = 0;
      }
    })
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      const shouldCommit =
        Math.abs(translationX) > COMMIT_THRESHOLD || Math.abs(velocityX) > 800;

      if (shouldCommit) {
        const direction: SwipeDirection = translationX > 0 ? 'request' : 'pass';
        runOnJS(flyOff)(direction);
      } else {
        if (stampPlayed.value === 1) runOnJS(playReleaseTick)();
        stampPlayed.value = 0;
        translateX.value = withSpring(0, { stiffness: 320, damping: 26 });
        translateY.value = withSpring(0, { stiffness: 320, damping: 26 });
        headProgress.value = withSpring(0, { stiffness: 320, damping: 26 });
      }
    });

  const backStyle = useAnimatedStyle(() => {
    const s = stackValue.value;
    const baseScale = 1 - s * 0.05;
    const baseOffsetY = s * 14;
    const baseOffsetX = interpolate(s, [0, 1, 2], [0, -22, 22], Extrapolation.CLAMP);
    const baseRotate = interpolate(s, [0, 1, 2], [0, -4, 4], Extrapolation.CLAMP);
    const baseOpacity = interpolate(s, [0, 1, 2], [1, 0.88, 0.62], Extrapolation.CLAMP);
    const rise = Math.abs(headProgress.value) * (s < 1.5 ? 1 : 0);
    return {
      transform: [
        { translateY: baseOffsetY - rise * BACK_RISE_TRANSLATE_Y },
        { translateX: baseOffsetX },
        { rotate: `${baseRotate}deg` },
        { scale: baseScale + rise * BACK_RISE_SCALE },
      ],
      opacity: baseOpacity,
    };
  });

  const topStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, COMMIT_THRESHOLD, COMMIT_THRESHOLD * 1.3],
      [1, 1.015, 1.025],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const reactiveGlowStyle = useAnimatedStyle(() => {
    const p = headProgress.value;
    const goldOpacity = interpolate(p, [0, 1], [0, 0.32], Extrapolation.CLAMP);
    const passOpacity = interpolate(p, [-1, 0], [0.20, 0], Extrapolation.CLAMP);
    return {
      opacity: goldOpacity + passOpacity,
      backgroundColor: p >= 0 ? 'rgba(232, 189, 88, 0.55)' : 'rgba(10, 31, 68, 0.45)',
    };
  });

  const enterAnim = entryFrom
    ? undefined
    : FadeIn.duration(360)
        .delay(stackIndex * 70)
        .easing(Easing.out(Easing.cubic));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={enterAnim}
        style={[styles.cardWrapper, isTop ? topStyle : backStyle]}
      >
        <View style={styles.ambientShadow} />

        <View style={styles.surface}>
          {isTop && (
            <>
              <Animated.View
                pointerEvents="none"
                style={[styles.reactiveGlow, reactiveGlowStyle]}
              />
              <SwipeStamp translateX={translateX} kind="request" />
              <SwipeStamp translateX={translateX} kind="pass" />
            </>
          )}

          <Pressable onPress={isTop ? handleTap : undefined} style={styles.tapArea}>
            {isTop ? <TopCardContent card={card} /> : <StackPreview />}
          </Pressable>

          {/* Subtle diagonal sheen only — no hard 1px bevel lines on the
              swipe cards. The bevels read as ugly white stripes against the
              dark brand zone. */}
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.05)']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.materialSheen}
            pointerEvents="none"
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function TopCardContent({ card }: { card: SeekerCardData }) {
  // The brand zone shows the SEEKER'S top-target company — the destination
  // they're trying to reach. Mirrors the seeker's swipe card which shows
  // the company they're being referred for.
  const primaryTarget = card.targetCompanies[0] ?? 'Bangalore';
  const brand = brandForName(primaryTarget);

  return (
    <View style={{ flex: 1 }}>
      {/* HERO: target company brand panel */}
      <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: brand.accent }]}>
            <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
          </View>
          <Text style={[styles.brandName, { color: brand.text }]} numberOfLines={1}>
            {primaryTarget}
          </Text>
          <View style={styles.brandSpacer} />
          <View style={[styles.openTag, { borderColor: brand.accent }]}>
            <View style={[styles.openDot, { backgroundColor: brand.accent }]} />
            <Text style={[styles.openText, { color: brand.accent }]}>OPEN</Text>
          </View>
        </View>

        <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
          {card.targetRole}
        </Text>

        {card.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {card.skills.slice(0, 3).map((s) => (
              <View key={s} style={styles.skillChip}>
                <Text style={[styles.skillText, { color: brand.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* CREAM ZONE — candidate + stats + match, full navy perimeter */}
      <View style={styles.creamZone}>
        <View style={styles.candidateSection}>
          <Text style={styles.sectionLabel}>CANDIDATE</Text>
          <View style={styles.candidateBlock}>
            <Avatar displayName={card.name} size="lg" verificationRing />
            <View style={styles.candidateMeta}>
              <Text style={styles.candidateName} numberOfLines={1}>{card.name}</Text>
              <Text style={styles.candidateSignal} numberOfLines={1}>
                {card.currentSignal}
              </Text>
            </View>
          </View>
          <View style={styles.candidateStats}>
            <StatPill label="Exp" value={`${card.yearsOfExperience}y`} />
            <StatPill label="Targets" value={`${card.targetCompanies.length}`} />
            <StatPill label="Skills" value={`${card.fullSkills.length}`} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.matchSection}>
          <View style={styles.matchHeader}>
            <Text style={styles.sectionLabel}>THEIR PITCH</Text>
            <Text style={styles.matchHint} numberOfLines={3}>
              {card.headline}
            </Text>
          </View>
          <MatchArc percent={card.matchPercent} size={84} animate light />
        </View>
      </View>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StackPreview() {
  // Intentionally NO identity content: back-of-deck cards must read as
  // anonymous navy plates so the next candidate isn't pre-revealed before
  // the user has even committed to the current swipe.
  return <View style={styles.stackPlate} />;
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
    height: CARD_HEIGHT,
  },
  ambientShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    borderRadius: 32,
    opacity: 0.45,
    transform: [{ translateY: 22 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.55,
    shadowRadius: 38,
  },
  surface: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.cardSurface,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 22,
    elevation: 14,
  },
  tapArea: { flex: 1 },

  /* Brand hero — white perimeter only on the OUTER edges (top, left, right). */
  brandZone: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#F5F1E8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  /* Cream zone — navy perimeter only on the OUTER edges (bottom, left, right). */
  creamZone: {
    flex: 1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#0A1F44',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 18,
  },
  brandName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  brandSpacer: { flex: 1 },
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  openDot: { width: 5, height: 5, borderRadius: 3 },
  openText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
  },
  role: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skillText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
  },

  /* Candidate on cream */
  candidateSection: {
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 16,
    gap: 12,
  },
  sectionLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: BLACK_50,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  candidateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  candidateMeta: { flex: 1, gap: 2 },
  candidateName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: BLACK,
    letterSpacing: -0.3,
  },
  candidateSignal: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK_70,
  },
  candidateStats: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: BLACK_05,
    alignItems: 'center',
    gap: 1,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
    color: BLACK,
  },
  statLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: BLACK_50,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  divider: {
    height: 1,
    backgroundColor: BLACK_08,
    marginHorizontal: 22,
  },

  /* Match — compact horizontal, mirrors EndorserCard */
  matchSection: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  matchHeader: {
    flex: 1,
    gap: 6,
  },
  matchHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: BLACK_70,
    lineHeight: 16,
  },

  /* Stack preview — muted sailor gold plate, mirrors EndorserCard back-of-deck */
  stackPlate: {
    flex: 1,
    backgroundColor: '#7A5F2E',
  },

  /* Credit-card material overlays */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },

  /* Reactive gold/navy mood overlay — gold while pulling right (endorse),
     cool navy while pulling left (pass). */
  reactiveGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    zIndex: 4,
  },
});
