import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { Avatar } from '../common/Avatar';
import { Phrase } from '../../utils/haptics';
import { getCompanyBrand } from './companyBrand';
import { officeImageFor } from '../activity/companyOffices';
import { colors } from '../../theme/colors';
import { SwipeStamp } from './SwipeStamp';
import { DISCOVER_CARD_HEIGHT, discoverCardLayout } from './discoverCardLayout';
import type {
  EntryFrom,
  SwipeCommand,
  SwipeDirection,
} from './SwipeDeck';
import type { EndorserCard as EndorserCardData } from './endorserCardData';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.4;
const SWIPE_OUT_MS = 220;
const ENTRY_IN_MS = 320;

// Caps vertical drift so a panicked diagonal drag can't fling the card off
// the deck plane. We let the user see ±90px of vertical motion at most;
// beyond that the drag damps asymptotically toward this ceiling.
const MAX_DRIFT_Y = 90;

// How far the back card "rises" toward the top slot at peak drag — the
// deck-of-cards reactive depth signal.
const BACK_RISE_TRANSLATE_Y = 8;
const BACK_RISE_SCALE = 0.025;

interface EndorserCardProps {
  card: EndorserCardData;
  isTop: boolean;
  stackIndex: number;
  headProgress: SharedValue<number>;
  entryFrom: EntryFrom;
  /** Retained for deck accounting. The count is intentionally not rendered. */
  swipesRemaining: number;
  /** When true and this is the top card, render the undo affordance as a
   *  circular button attached to the left edge of the swipes-left pill. */
  canUndo?: boolean;
  onUndo?: () => void;
  /** Fires the moment a swipe commits (start of fly-off). Lets the parent
   *  fire reactions (celebration, etc.) in lock-step with the card's exit. */
  onCommitStart?: (direction: SwipeDirection) => void;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
  registerSwipe?: (cmd: SwipeCommand) => void;
}

export function EndorserCard({
  card,
  isTop,
  stackIndex,
  headProgress,
  entryFrom,
  canUndo = false,
  onUndo,
  onCommitStart,
  onSwiped,
  onTap,
  registerSwipe,
}: EndorserCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Tracks whether the user crossed the stamp-reveal threshold during the
  // current drag. Used so we can play a soft "released" tick when they pull
  // back without committing.
  const stampPlayed = useSharedValue(0);
  // Animated stackIndex — drives smooth promotion when this card moves from
  // a back slot to the top slot (after a swipe ahead of it commits). Without
  // this, stackIndex prop changes would snap the transform.
  const stackValue = useSharedValue(stackIndex);
  // Suppresses tap → expand while the card is mid-flight, so a stray tap
  // during the 220ms fly-off doesn't pop the expanded sheet for a card
  // whose swipe has already committed.
  const isFlyingRef = useRef(false);

  const playRequest = useCallback(() => Phrase.swipeRequest(), []);
  const playPass = useCallback(() => Phrase.swipePass(), []);
  const playStampReveal = useCallback(() => Phrase.stampReveal(), []);
  const playReleaseTick = useCallback(() => Phrase.tick(), []);

  // The latest onSwiped passed by the deck. We hold it in a ref so the
  // imperative swipe command we register doesn't capture a stale closure.
  const onSwipedRef = useRef(onSwiped);
  onSwipedRef.current = onSwiped;
  const finishSwipe = useCallback(
    (direction: SwipeDirection) => onSwipedRef.current(direction),
    [],
  );
  // Same ref pattern for onCommitStart so the imperative path always sees the
  // latest handler.
  const onCommitStartRef = useRef(onCommitStart);
  onCommitStartRef.current = onCommitStart;

  /**
   * Drives the off-screen fly animation, regardless of trigger (gesture vs.
   * action button vs. expanded modal). Mutates translateX/Y, plays the
   * appropriate haptic, and reports the commit on completion.
   */
  const flyOff = useCallback(
    (direction: SwipeDirection) => {
      isFlyingRef.current = true;
      const target = direction === 'request' ? FLY_OFF_X : -FLY_OFF_X;
      if (direction === 'request') playRequest();
      else playPass();
      // Fire the commit-start reaction NOW (in lock-step with haptic + card
      // motion) — not at the end of the 220ms fly-off. Without this the
      // celebration burst would land after the card has already left.
      onCommitStartRef.current?.(direction);
      // Keep the user-visible vertical drift through the fly-off so the card
      // arcs out instead of sliding flat — small but tactile.
      const exitDriftY = translateY.value + 28;
      translateX.value = withTiming(
        target,
        { duration: SWIPE_OUT_MS, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) runOnJS(finishSwipe)(direction);
        },
      );
      translateY.value = withTiming(exitDriftY, { duration: SWIPE_OUT_MS });
      // Ensure headProgress lands at the committed sign even if the gesture
      // released early (so back cards ride the rest of the way up).
      headProgress.value = withTiming(direction === 'request' ? 1 : -1, {
        duration: SWIPE_OUT_MS / 2,
      });
    },
    [translateX, translateY, headProgress, playRequest, playPass, finishSwipe],
  );

  /**
   * Tap → expand handler. Gated by `isFlyingRef` so a tap landing during the
   * 220ms swipe-out animation is ignored (the card has already committed; we
   * don't want to open the expanded sheet on something that's about to leave).
   */
  const handleTap = useCallback(() => {
    if (isFlyingRef.current) return;
    if (onTap) onTap();
  }, [onTap]);

  // Register our imperative swipe command with the deck the moment we become
  // top. Re-runs if the registration callback identity changes.
  useEffect(() => {
    if (!isTop || !registerSwipe) return;
    registerSwipe((direction) => flyOff(direction));
  }, [isTop, registerSwipe, flyOff]);

  // Spring stackIndex changes so the card slides smoothly into a new slot
  // when the cards above it commit.
  useEffect(() => {
    stackValue.value = withSpring(stackIndex, {
      damping: 22,
      stiffness: 180,
      mass: 0.9,
    });
  }, [stackIndex, stackValue]);

  /**
   * Entry animation for restored (undone) cards. The deck flags this on the
   * top card by setting entryFrom; we slide in from the matching edge and
   * settle to center with a spring.
   */
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
      // Asymptotic vertical clamp — tanh-style soft cap. Lets the card feel
      // alive on small Y motion but refuses to fly off vertically.
      const dy = e.translationY;
      translateY.value =
        MAX_DRIFT_Y * Math.tanh(dy / MAX_DRIFT_Y);

      // Publish normalized progress for back cards / overlays. Clamp at the
      // worklet level so consumers don't have to repeat it.
      const p = e.translationX / COMMIT_THRESHOLD;
      headProgress.value = p > 1 ? 1 : p < -1 ? -1 : p;

      const past = Math.abs(e.translationX) > COMMIT_THRESHOLD * 0.6;
      if (past && stampPlayed.value === 0) {
        stampPlayed.value = 1;
        runOnJS(playStampReveal)();
      } else if (!past && stampPlayed.value === 1) {
        // User retreated below the threshold — stamp un-reveals. We don't
        // play a haptic here because a release tick on actual cancel is more
        // satisfying and avoids tick-flutter on hovering near the threshold.
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
        // Cancelled: spring everything back. If the user had crossed the
        // stamp threshold mid-drag, play a soft tick to acknowledge the
        // reversal — gives the bounce-back a beat instead of feeling silent.
        if (stampPlayed.value === 1) {
          runOnJS(playReleaseTick)();
        }
        stampPlayed.value = 0;
        translateX.value = withSpring(0, { stiffness: 320, damping: 26 });
        translateY.value = withSpring(0, { stiffness: 320, damping: 26 });
        headProgress.value = withSpring(0, { stiffness: 320, damping: 26 });
      }
    });

  /**
   * Back-card transform — driven by the spring-animated stackValue plus a
   * reactive depth boost as the top card is dragged. The boost interpolates
   * from |headProgress| so symmetric on left/right swipes.
   */
  const backStyle = useAnimatedStyle(() => {
    const s = stackValue.value;
    const baseScale = 1 - s * 0.05;
    const baseOffsetY = s * 14;
    // Stack 1 leans left, stack 2 leans right — keeps the deck silhouette
    // readable behind the top card.
    const baseOffsetX = interpolate(s, [0, 1, 2], [0, -22, 22], Extrapolation.CLAMP);
    const baseRotate = interpolate(s, [0, 1, 2], [0, -4, 4], Extrapolation.CLAMP);
    const baseOpacity = interpolate(s, [0, 1, 2], [1, 0.88, 0.62], Extrapolation.CLAMP);

    // Rise toward top slot proportional to how far the user has dragged.
    // We only lift the immediate next card (stackIndex < 1.5) so the third
    // card stays planted.
    const rise = Math.abs(headProgress.value) * (s < 1.5 ? 1 : 0);
    const scale = baseScale + rise * BACK_RISE_SCALE;
    const offsetY = baseOffsetY - rise * BACK_RISE_TRANSLATE_Y;

    return {
      transform: [
        { translateY: offsetY },
        { translateX: baseOffsetX },
        { rotate: `${baseRotate}deg` },
        { scale },
      ],
      opacity: baseOpacity,
    };
  });

  /**
   * Top-card transform — gesture-driven. Tilts proportionally to translateX,
   * adds a subtle scale-down at heavy drag for "weight," and respects the
   * user's vertical drift.
   */
  const topStyle = useAnimatedStyle(() => {
    // Residual back-stack transform — when a card is promoted from a back
    // slot, stackValue springs from its old index → 0. We read that and fade
    // the stack offset/scale/rotate/opacity in lock-step so the card SLIDES
    // smoothly into the top slot instead of snapping. Without this, the
    // moment isTop flips true, the card jumps from Y≈6 → 0, scale 0.95 → 1,
    // opacity 0.88 → 1.
    const s = stackValue.value;
    const residualY = s * 14;
    const residualX = interpolate(s, [0, 1, 2], [0, -22, 22], Extrapolation.CLAMP);
    const residualRotateDeg = interpolate(s, [0, 1, 2], [0, -4, 4], Extrapolation.CLAMP);
    const residualScale = 1 - s * 0.05;
    const residualOpacity = interpolate(s, [0, 1, 2], [1, 0.88, 0.62], Extrapolation.CLAMP);
    // Carry the headProgress-driven "rise" so this frame is continuous with
    // the previous backStyle frame. The rise springs to 0 alongside
    // stackValue once topId changes.
    const rise = Math.abs(headProgress.value) * (s > 0.05 ? 1 : 0);
    const yWithRise = residualY - rise * BACK_RISE_TRANSLATE_Y;
    const scaleWithRise = residualScale + rise * BACK_RISE_SCALE;

    // Gesture transforms — only visible once the residual has settled.
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    const gestureScale = interpolate(
      Math.abs(translateX.value),
      [0, COMMIT_THRESHOLD, COMMIT_THRESHOLD * 1.3],
      [1, 1.015, 1.025],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value + residualX },
        { translateY: translateY.value + yWithRise },
        { rotate: `${rotate + residualRotateDeg}deg` },
        { scale: gestureScale * scaleWithRise },
      ],
      opacity: residualOpacity,
    };
  });

  // Reactive overlay glow — gold tint while user pulls right, cool dim while
  // pulling left. Sits above the brand zone but below the stamp/seal so it
  // reads as an ambient mood shift rather than a discrete sticker.
  const reactiveGlowStyle = useAnimatedStyle(() => {
    const p = headProgress.value;
    const goldOpacity = interpolate(p, [0, 1], [0, 0.32], Extrapolation.CLAMP);
    const passOpacity = interpolate(p, [-1, 0], [0.20, 0], Extrapolation.CLAMP);
    return {
      opacity: goldOpacity + passOpacity,
      // Cross-fade hue: positive side leans gold, negative side leans cool
      // navy — implemented via two stacked layers; here we shift the bg.
      backgroundColor: p >= 0 ? 'rgba(232, 189, 88, 0.55)' : 'rgba(10, 31, 68, 0.45)',
    };
  });

  /**
   * Deal-in entrance — fires once when the card first mounts (initial screen
   * load OR a freshly-revealed third card after a swipe). Stack-index-based
   * delay gives the deck a "dealt" rhythm rather than a wall-of-cards pop.
   * Skipped entirely for cards entering via Undo (entryFrom drives that path
   * instead, so we don't double-animate).
   */
  const enterAnim = entryFrom
    ? undefined
    : FadeIn.duration(360)
        .delay(stackIndex * 70)
        .easing(Easing.out(Easing.cubic));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={enterAnim}
        style={styles.cardWrapper}
      >
        <Animated.View style={[styles.cardInner, isTop ? topStyle : backStyle]}>
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
              colors={[
                'rgba(255,255,255,0.06)',
                'rgba(255,255,255,0)',
                'rgba(0,0,0,0.05)',
              ]}
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
      </Animated.View>
    </GestureDetector>
  );
}

function TopCardContent({ card }: { card: EndorserCardData }) {
  const brand = getCompanyBrand(card.companyId);
  const officeImage = useMemo(() => officeImageFor(card.companyName), [card.companyName]);
  const proofLine = `${card.name} can endorse this role.`;
  const metaLine = `${card.hires} hires · ${card.responseTime} reply`;

  return (
    <View style={styles.fullMediaCard}>
      <View style={[styles.officeFallback, { backgroundColor: brand.tint }]} />
      {officeImage && <Image source={officeImage} style={styles.officeImage} resizeMode="cover" />}
      <LinearGradient
        colors={[
          'rgba(1, 7, 17, 0)',
          'rgba(1, 7, 17, 0.52)',
          'rgba(1, 7, 17, 0.86)',
          'rgba(1, 7, 17, 0.98)',
        ]}
        locations={[0.44, 0.58, 0.76, 1]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <View style={styles.overlayContent}>
        <View style={styles.overlayTitleRow}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.84}
            numberOfLines={1}
            style={styles.companyTitle}
          >
            {card.companyName}
          </Text>
          <View style={styles.verifiedChip}>
            <Text style={styles.verifiedChipText}>VERIFIED</Text>
          </View>
        </View>

        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={2}
          style={styles.companyRole}
        >
          {card.jobTitle}
        </Text>

        <View style={styles.endorserProofRow}>
          <Avatar
            displayName={card.name}
            size="sm"
            uri={card.avatarUrl}
            verificationRing
          />
          <Text numberOfLines={2} style={styles.endorserProofText}>
            {proofLine}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.endorserMetaLine}>
          {metaLine}
        </Text>
      </View>
    </View>
  );
}

function StackPreview() {
  // Intentionally NO identity content: back-of-deck cards must read as
  // anonymous gold plates so the next candidate isn't pre-revealed before
  // the user has even committed to the current swipe.
  return <View style={styles.stackPlate} />;
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    left: discoverCardLayout.inset,
    right: discoverCardLayout.inset,
    top: 0,
    height: DISCOVER_CARD_HEIGHT,
  },
  cardInner: {
    flex: 1,
  },
  ambientShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    borderRadius: discoverCardLayout.radius,
    opacity: 0.50,
    transform: [{ translateY: 28 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 44,
  },
  surface: {
    flex: 1,
    borderRadius: discoverCardLayout.radius,
    overflow: 'hidden',
    backgroundColor: colors.cardSurface,
    // Drop shadow gives the card the "lifted credit card" feel
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 22,
    elevation: 14,
  },
  tapArea: { flex: 1 },

  /* Subtle diagonal sheen — the only material overlay on the swipe card */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: discoverCardLayout.radius,
  },

  /* Reactive ambient overlay — gold for "endorse," cool navy for "pass."
     Sits above the surface but below the stamp so it reads as a mood, not
     a sticker. */
  reactiveGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: discoverCardLayout.radius,
    zIndex: 4,
  },

  fullMediaCard: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  officeImage: {
    width: '100%',
    height: '100%',
  },
  officeFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: discoverCardLayout.overlayPaddingHorizontal,
    paddingBottom: discoverCardLayout.overlayPaddingBottom,
    gap: discoverCardLayout.overlayGap,
  },
  overlayTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: discoverCardLayout.titleRowGap,
  },
  companyTitle: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 36,
    lineHeight: 40,
    color: colors.cream,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verifiedChip: {
    minWidth: 88,
    height: discoverCardLayout.chipHeight,
    borderRadius: discoverCardLayout.chipRadius,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: discoverCardLayout.chipPaddingHorizontal,
    backgroundColor: 'rgba(3, 7, 18, 0.42)',
  },
  verifiedChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    letterSpacing: 0.9,
    color: colors.goldBright,
  },
  companyRole: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 21,
    color: 'rgba(245, 241, 232, 0.78)',
  },
  endorserProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  endorserProofText: {
    flex: 1,
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(245, 241, 232, 0.82)',
  },
  endorserMetaLine: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(245, 241, 232, 0.72)',
  },

  /* Stack preview — anonymous plate, no identity content. Muted sailor gold
     so back-of-deck cards read as warm trim against the navy page, while the
     top card's brand zone stays the visual focus. */
  stackPlate: {
    flex: 1,
    backgroundColor: '#7A5F2E',
  },

  /* Undo affordance anchored to the card. */
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
