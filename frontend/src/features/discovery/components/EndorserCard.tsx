import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
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
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Phrase } from '../../../utils/haptics';
import { colors } from '../../../theme/colors';
import { SwipeStamp } from './SwipeStamp';
import { EndorserCardContent, EndorserStackPreview } from './EndorserCardContent';
import { styles } from './EndorserCard.styles';
import type { SwipeDirection } from './SwipeDeck';
import {
  BACK_RISE_SCALE,
  BACK_RISE_TRANSLATE_Y,
  COMMIT_THRESHOLD,
  ENTRY_IN_MS,
  FLY_OFF_X,
  MAX_DRIFT_Y,
  SWIPE_OUT_MS,
  WINDOW_WIDTH,
  type EndorserCardProps,
} from './endorserCardConfig';

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

  // Reactive overlay glow — vermilion tint while user pulls right, sage while
  // pulling left. Sits above the brand zone but below the stamp/seal so it
  // reads as an ambient mood shift rather than a discrete sticker.
  const reactiveGlowStyle = useAnimatedStyle(() => {
    const p = headProgress.value;
    const endorseOpacity = interpolate(p, [0, 1], [0, 0.30], Extrapolation.CLAMP);
    const passOpacity = interpolate(p, [-1, 0], [0.20, 0], Extrapolation.CLAMP);
    return {
      opacity: endorseOpacity + passOpacity,
      backgroundColor: p >= 0 ? colors.vermilionDim : 'rgba(157, 181, 164, 0.30)',
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
              {isTop ? <EndorserCardContent card={card} /> : <EndorserStackPreview />}
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
