import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
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

interface SeekerCardProps {
  card: SeekerCardData;
  isTop: boolean;
  stackIndex: number;
  headProgress: SharedValue<number>;
  entryFrom: EntryFrom;
  /** Retained for deck accounting. The count is intentionally not rendered. */
  swipesRemaining: number;
  /** Top-card-only undo affordance, attached to the left of the pill. */
  canUndo?: boolean;
  onUndo?: () => void;
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
  canUndo = false,
  onUndo,
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
              <SwipeStamp translateX={translateX} kind="request" commitLabel="ENDORSE" />
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

        {isTop && canUndo && onUndo && (
          <View
            style={styles.clipMount}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={onUndo}
              hitSlop={8}
              style={({ pressed }) => [
                styles.undoCircle,
                pressed && styles.undoCirclePressed,
              ]}
            >
              <Ionicons name="arrow-undo" size={14} color={colors.gold} />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

function TopCardContent({ card }: { card: SeekerCardData }) {
  const primaryTarget = card.targetCompanies[0] ?? 'India';
  const brand = brandForName(primaryTarget);
  const roleLine = `${card.targetRole} · ${primaryTarget}`;
  const proofLine = candidateProofLine(card);
  const skillLine = compactSkillLine(card.skills);

  return (
    <View style={styles.fullMediaCard}>
      <View style={[styles.mediaFallback, { backgroundColor: brand.tint }]} />
      <Image source={{ uri: card.photoUrl }} style={styles.heroPhoto} resizeMode="cover" />
      <LinearGradient
        colors={[
          'rgba(1, 7, 17, 0.02)',
          'rgba(1, 7, 17, 0.34)',
          'rgba(1, 7, 17, 0.96)',
        ]}
        locations={[0.36, 0.62, 1]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <View style={styles.overlayContent}>
        <View style={styles.overlayTitleRow}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.86}
            numberOfLines={2}
            style={styles.candidateName}
          >
            {card.name}
          </Text>
          <View style={styles.experienceChip}>
            <Text style={styles.experienceChipText}>{card.yearsOfExperience}Y EXP</Text>
          </View>
        </View>

        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.86}
          numberOfLines={1}
          style={styles.overlayRole}
        >
          {roleLine}
        </Text>
        <Text numberOfLines={2} style={styles.overlayProof}>
          {proofLine}
        </Text>
        <Text numberOfLines={1} style={styles.overlayMeta}>
          {skillLine}
        </Text>
        <View style={styles.grabberHint} />
      </View>
    </View>
  );
}

function candidateProofLine(card: SeekerCardData): string {
  const firstSentence = card.headline.split('.')[0]?.trim();
  if (!firstSentence) return card.currentSignal;
  const match = firstSentence.match(/^(.+?)\s+at\s+(.+)$/i);
  if (!match) return firstSentence;
  const role = shortRole(match[1]);
  const company = shortCompany(match[2]);
  const target = roleFamily(card.targetRole);
  return `${company} ${role} targeting ${target} referrals.`;
}

function compactSkillLine(skills: string[]): string {
  const topSkills = skills.slice(0, 2).filter(Boolean);
  return topSkills.length > 0 ? topSkills.join(' + ') : 'Strong role fit';
}

function shortRole(role: string): string {
  return role
    .replace(/Software Development Engineer/gi, 'SDE')
    .replace(/Site Reliability Engineer/gi, 'SRE')
    .trim();
}

function shortCompany(company: string): string {
  return company.replace(/\s+India$/i, '').trim();
}

function roleFamily(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized.includes('platform')) return 'platform';
  if (normalized.includes('frontend')) return 'frontend';
  if (normalized.includes('backend')) return 'backend';
  if (normalized.includes('product')) return 'product';
  if (normalized.includes('data')) return 'data';
  return 'role-fit';
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

  fullMediaCard: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  mediaFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  bottomScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 9,
  },
  overlayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  candidateName: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 36,
    lineHeight: 40,
    color: colors.cream,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  experienceChip: {
    minWidth: 78,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.42)',
  },
  experienceChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.goldBright,
  },
  overlayRole: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 21,
    color: 'rgba(245, 241, 232, 0.78)',
  },
  overlayProof: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    lineHeight: 21,
    color: colors.goldBright,
  },
  overlayMeta: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(245, 241, 232, 0.72)',
  },
  grabberHint: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 999,
    marginTop: 18,
    backgroundColor: 'rgba(245, 241, 232, 0.44)',
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

  /* Reactive gold/navy mood overlay — gold while pulling right (accept),
     cool navy while pulling left (pass). */
  reactiveGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    zIndex: 4,
  },

  /* Undo affordance anchored to the card's bottom edge. */
  clipMount: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -14,
    alignItems: 'center',
  },
  undoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 31, 68, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.40)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  undoCirclePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
