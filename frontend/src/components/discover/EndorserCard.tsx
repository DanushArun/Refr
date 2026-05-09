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
import { Phrase } from '../../utils/haptics';
import { MatchArc } from './MatchArc';
import { getCompanyBrand } from './companyBrand';
import { colors } from '../../theme/colors';
import { SwipeStamp } from './SwipeStamp';
import type {
  EntryFrom,
  SwipeCommand,
  SwipeDirection,
} from './SwipeDeck';
import type { EndorserCard as EndorserCardData } from './endorserCardData';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.4;
const SWIPE_OUT_MS = 220;
const ENTRY_IN_MS = 320;
const CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.62));

// Caps vertical drift so a panicked diagonal drag can't fling the card off
// the deck plane. We let the user see ±90px of vertical motion at most;
// beyond that the drag damps asymptotically toward this ceiling.
const MAX_DRIFT_Y = 90;

// How far the back card "rises" toward the top slot at peak drag — the
// deck-of-cards reactive depth signal.
const BACK_RISE_TRANSLATE_Y = 8;
const BACK_RISE_SCALE = 0.025;

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_50 = 'rgba(0, 0, 0, 0.50)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

interface EndorserCardProps {
  card: EndorserCardData;
  isTop: boolean;
  stackIndex: number;
  headProgress: SharedValue<number>;
  entryFrom: EntryFrom;
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
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    // Slight grow when committed past threshold so the card "lifts off" the
    // deck before flying — feels purposeful rather than slid.
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

function TopCardContent({ card }: { card: EndorserCardData }) {
  const brand = getCompanyBrand(card.companyId);

  return (
    <View style={{ flex: 1 }}>
      {/* === HERO: Company brand panel === */}
      <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: brand.accent }]}>
            <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
          </View>
          <Text style={[styles.brandName, { color: brand.text }]}>{card.companyName}</Text>
          <View style={styles.brandSpacer} />
          <View style={[styles.openTag, { borderColor: brand.accent }]}>
            <View style={[styles.openDot, { backgroundColor: brand.accent }]} />
            <Text style={[styles.openText, { color: brand.accent }]}>OPEN</Text>
          </View>
        </View>

        <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
          {card.jobTitle}
        </Text>

        <View style={styles.skillsRow}>
          {card.skills.slice(0, 3).map((s) => (
            <View key={s} style={styles.skillChip}>
              <Text style={[styles.skillText, { color: brand.text }]}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* === CREAM ZONE — referrer + match, full navy perimeter === */}
      <View style={styles.creamZone}>
        <View style={styles.referrerSection}>
          <Text style={styles.sectionLabel}>REFERRED BY</Text>
          <View style={styles.referrerCard}>
            <Avatar displayName={card.name} size="lg" verificationRing />
            <View style={styles.referrerMeta}>
              <Text style={styles.referrerName} numberOfLines={1}>{card.name}</Text>
              <Text style={styles.referrerTitle} numberOfLines={1}>
                Verified at {card.companyName}
              </Text>
            </View>
          </View>
          <View style={styles.referrerStats}>
            <StatPill label="Trust" value={`★ ${card.trustScore}`} />
            <StatPill label="Hires" value={`${card.hires}`} />
            <StatPill label="Reply" value={card.responseTime} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.matchSection}>
          <View style={styles.matchHeader}>
            <Text style={styles.sectionLabel}>YOUR MATCH</Text>
            <Text style={styles.matchHint} numberOfLines={2}>
              Skill overlap, target fit, and {card.companyName}'s acceptance rate
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
  // anonymous gold plates so the next candidate isn't pre-revealed before
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
    opacity: 0.50,
    transform: [{ translateY: 28 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 44,
  },
  surface: {
    flex: 1,
    borderRadius: 32,
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
    borderRadius: 32,
  },

  /* Reactive ambient overlay — gold for "endorse," cool navy for "pass."
     Sits above the surface but below the stamp so it reads as a mood, not
     a sticker. */
  reactiveGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    zIndex: 4,
  },

  brandZone: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  creamZone: {
    flex: 1,
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

  /* Referred-by — primary credibility on white */
  referrerSection: {
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
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  referrerMeta: { flex: 1, gap: 2 },
  referrerName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: BLACK,
    letterSpacing: -0.3,
  },
  referrerTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK_70,
  },
  referrerStats: {
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

  /* Match — compact horizontal */
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

  /* Stack preview — anonymous plate, no identity content. Muted sailor gold
     so back-of-deck cards read as warm trim against the navy page, while the
     top card's brand zone stays the visual focus. */
  stackPlate: {
    flex: 1,
    backgroundColor: '#7A5F2E',
  },
});
