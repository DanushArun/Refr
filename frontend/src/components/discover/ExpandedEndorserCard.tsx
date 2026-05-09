import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../common/Avatar';
import { PersonName } from '../common/PersonName';
import { MatchArc } from './MatchArc';
import { getCompanyBrand } from './companyBrand';
import { officeImageFor } from '../activity/companyOffices';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import type { EndorserCard as EndorserCardData } from './endorserCardData';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// These constants must match EndorserCard's swipe-deck position so the
// expansion springs out of the EXACT card the user tapped.
const CARD_LEFT = 20;
const CARD_WIDTH = SCREEN_W - 40;
const CARD_HEIGHT = Math.min(580, Math.round(SCREEN_H * 0.62));
// The deck starts roughly below the header (60) + filter row (54) + a 8px
// breathing gap. Adjust if those header heights change in DiscoverScreen.
const CARD_TOP_FROM_SCREEN = 60 + 54 + 8;

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_55 = 'rgba(0, 0, 0, 0.55)';
const BLACK_50 = 'rgba(0, 0, 0, 0.50)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

interface ExpandedEndorserCardProps {
  card: EndorserCardData | null;
  onClose: () => void;
  onPass: () => void;
  onCommit: () => void;
}

/**
 * Card-to-full-screen container transform.
 *
 * On mount the card animates from its swipe-deck rect into a full-screen
 * detail sheet. The brand-zone hero stays in place visually (same colors,
 * same typography, same role title) while extra detail sections fade in
 * underneath as the surface grows.
 *
 * Close reverses the animation, then calls onClose so the parent unmounts us.
 *
 * Pure JS animation (no native module needed). Uses Reanimated 4 spring on a
 * single 0..1 progress shared value driving every interpolated dimension.
 */
export function ExpandedEndorserCard({
  card,
  onClose,
  onPass,
  onCommit,
}: ExpandedEndorserCardProps) {
  // Hooks must run unconditionally — we render null if card is missing.
  const progress = useSharedValue(0);
  // Pan-to-dismiss drag offset, separate from the open/close progress so
  // dragging during the open animation doesn't fight it.
  const dragY = useSharedValue(0);
  // Live ScrollView offset so the Pan only treats touches as dismiss-drags
  // when the user is already at the top (otherwise the inner scroll wins
  // and the outer Pan is never given a chance to take over).
  const scrollY = useSharedValue(0);
  // Sticky flag: once the Pan started a dismiss drag while scrollY was 0,
  // keep responding even if the user momentarily flicks the scroll.
  const dismissActive = useSharedValue(false);
  const safe = useMemo(() => card, [card]);

  useEffect(() => {
    if (!card) return;
    Phrase.tap();
    dragY.value = 0;
    progress.value = withSpring(1, {
      damping: 24,
      stiffness: 220,
      mass: 0.9,
    });
  }, [card, progress, dragY]);

  const handleClose = () => {
    Phrase.tap();
    progress.value = withTiming(
      0,
      { duration: 280, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const handlePass = () => {
    // Match the deck's gesture haptic so the user gets identical physical
    // feedback regardless of whether they passed via swipe or tap-in-modal.
    Phrase.swipePass();
    onPass();
  };

  const handleCommit = () => {
    // Heartbeat phrase — the "I want this" moment. The full match-cadence
    // celebration fires later from the parent on commit; this is the press
    // confirmation so the user feels their tap land.
    Phrase.swipeRequest();
    onCommit();
  };

  // Track scroll offset live (UI thread) so the Pan can decide whether the
  // user is actually trying to dismiss vs. just scrolling content.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  /**
   * Swipe down to minimize back into the swipe deck. The trick to making
   * this work alongside an inner ScrollView: run BOTH gestures simultaneously
   * (`Gesture.Simultaneous` with the ScrollView's native gesture below), and
   * only let the Pan write to `dragY` while the ScrollView is at the top.
   * Once a downward drag has begun at the top, the Pan stays sticky via
   * `dismissActive` so a transient scroll bounce doesn't cancel the close.
   */
  const dismissGesture = Gesture.Pan()
    // 4px activation — a barely-there pull engages the dismiss drag so a
    // gentle swipe-down feels responsive instead of resistant.
    .activeOffsetY(4)
    .onBegin(() => {
      dismissActive.value = scrollY.value <= 0;
    })
    .onUpdate((e) => {
      if (e.translationY <= 0) {
        // Upward drag — let the ScrollView handle it; cancel any in-progress
        // dismiss drag.
        if (dismissActive.value) {
          dismissActive.value = false;
          dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
        }
        return;
      }
      // Downward drag. Only respond if we started at the top.
      if (scrollY.value <= 0 && !dismissActive.value) {
        dismissActive.value = true;
      }
      if (dismissActive.value) {
        dragY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (!dismissActive.value) return;
      dismissActive.value = false;
      // Gentle thresholds: a soft drag of ~50px or a flick at 350px/s
      // dismisses. Way more forgiving than the previous 120/800.
      const shouldDismiss = e.translationY > 50 || e.velocityY > 350;
      if (shouldDismiss) {
        // Reset dragY so the morph-back animation plays cleanly — the surface
        // tucks back to the swipe-deck card-rect without the user's drag
        // offset baked in. Identical end-result to the X button.
        dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
        runOnJS(handleClose)();
      } else {
        dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
      }
    });

  // Run the ScrollView's native pan and our dismiss Pan at the same time so
  // either can drive depending on intent.
  const composedGesture = Gesture.Simultaneous(dismissGesture, Gesture.Native());

  const surfaceStyle = useAnimatedStyle(() => {
    const t = progress.value;
    // Drag-to-dismiss adds vertical translate + subtle scale-down so the user
    // physically feels the card retreat as they pull it.
    const dragScale = 1 - Math.min(0.06, Math.max(0, dragY.value) / 1400);
    return {
      position: 'absolute',
      left: interpolate(t, [0, 1], [CARD_LEFT, 0], Extrapolation.CLAMP),
      top: interpolate(t, [0, 1], [CARD_TOP_FROM_SCREEN, 0], Extrapolation.CLAMP),
      width: interpolate(t, [0, 1], [CARD_WIDTH, SCREEN_W], Extrapolation.CLAMP),
      height: interpolate(t, [0, 1], [CARD_HEIGHT, SCREEN_H], Extrapolation.CLAMP),
      borderRadius: interpolate(t, [0, 1], [32, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: dragY.value },
        { scale: dragScale },
      ],
    };
  });

  // Backdrop dims with morph progress AND lightens slightly during drag
  // so the screen below "shows through" as the card retreats.
  const backdropStyle = useAnimatedStyle(() => {
    const dragFade = Math.max(0, 1 - dragY.value / 400);
    return {
      opacity:
        interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP) *
        dragFade,
    };
  });

  // Extras crossfade in once the surface is mostly expanded
  const extrasStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.65, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0.65, 1],
          [16, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const closeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
  }));

  if (!safe) return null;

  const brand = getCompanyBrand(safe.companyId);
  const officeImage = officeImageFor(safe.companyName);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      // The Modal puts the card in its own native window so it covers the
      // floating tab bar that sits in the navigation tree.
      onRequestClose={handleClose}
    >
    <View style={StyleSheet.absoluteFillObject}>
      {/* Backdrop dims the swipe screen as the card expands */}
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.surface, surfaceStyle]}>
        {/* Pill grabber centered at top — affordance hint for swipe-down */}
        <View style={styles.grabberRow} pointerEvents="none">
          <View style={styles.grabber} />
        </View>

        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* === HERO IMAGE — full-bleed office photo, the desire-driver === */}
          <View style={styles.heroImageZone}>
            <View style={[styles.heroImageFallback, { backgroundColor: brand.tint }]} />
            {officeImage && (
              <Image
                source={officeImage}
                style={styles.heroImage}
                resizeMode="cover"
              />
            )}
            {/* Bottom shade so the seam into the brand zone reads softly */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
              style={styles.heroImageShade}
              pointerEvents="none"
            />
            {/* Hairline at the very bottom — premium magazine-cover feel */}
            <View style={styles.heroImageEdge} pointerEvents="none" />
          </View>

          {/* Brand band — slim, same as the redesigned swipe card */}
          <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { borderColor: brand.accent }]}>
                <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
              </View>
              <Text
                style={[styles.brandName, { color: brand.text }]}
                numberOfLines={1}
              >
                {safe.companyName}
              </Text>
              <View style={styles.brandSpacer} />
              <View style={styles.openTag}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>OPEN</Text>
              </View>
            </View>
            <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
              {safe.jobTitle}
            </Text>
          </View>

          <View style={styles.creamZone}>
            {/* === Headline row: REFERRED BY (left) | YOUR MATCH (right) === */}
            <View style={styles.headlineRow}>
              <View style={styles.referrerCol}>
                <Text style={styles.sectionLabel}>REFERRED BY</Text>
                <View style={styles.referrerCard}>
                  <Avatar displayName={safe.name} size="lg" verificationRing />
                  <View style={styles.referrerMeta}>
                    <PersonName name={safe.name} textStyle={styles.referrerName} />
                    <View style={styles.verifiedRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#3897F0" />
                      <Text style={styles.verifiedText}>Verified at {safe.companyName}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statRow}>
                  <Stat label="TRUST" value={`★ ${safe.trustScore}`} />
                  <Stat label="HIRES" value={`${safe.hires}`} />
                  <Stat label="REPLY" value={safe.responseTime} />
                </View>
              </View>

              <View style={styles.matchCol}>
                <Text style={styles.sectionLabel}>YOUR MATCH</Text>
                <MatchArc percent={safe.matchPercent} size={92} animate light />
                <Text style={styles.matchHint} numberOfLines={1}>Skill overlap</Text>
              </View>
            </View>

            {/* === Extras — fade in once surface is mostly expanded === */}
            <Animated.View style={[styles.extras, extrasStyle]}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ABOUT</Text>
                <Text style={styles.about}>
                  Works at <Text style={styles.aboutAccent}>{safe.companyName}</Text> as
                  a {safe.jobTitle}. Typical response time is {safe.responseTime}.
                  Has endorsed {safe.hires} successful hire{safe.hires === 1 ? '' : 's'}
                  {' '}to date. Accepts {safe.acceptanceRate}% of incoming requests
                  — prioritises strong match-fit over volume.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SKILLS THEY ENDORSE FOR</Text>
                <View style={styles.skillsExtras}>
                  {safe.skills.map((s) => (
                    <View key={s} style={styles.skillExtraChip}>
                      <Text style={styles.skillExtraText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>WHY THIS MATCH</Text>
                <Text style={styles.about}>
                  Computed from your target companies, your skill overlap with
                  {' '}{safe.name.split(' ')[0]}, and historical acceptance patterns
                  at {safe.companyName}.
                </Text>
              </View>
            </Animated.View>

            {/* Bottom spacer so action bar doesn't cover content */}
            <View style={{ height: 110 }} />
          </View>
        </Animated.ScrollView>

        {/* Close button — fades in mid-expansion */}
        <Animated.View style={[styles.closeWrap, closeStyle]} pointerEvents="box-none">
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* Action bar pinned to bottom; extras-style opacity ties it to the
            full-expansion state so it doesn't appear during morph */}
        <Animated.View style={[styles.actionBar, extrasStyle]}>
          <Pressable onPress={handlePass} style={styles.passBtn}>
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={styles.passBtnText}>Pass</Text>
          </Pressable>
          <Pressable onPress={handleCommit} style={styles.commitBtn}>
            <Ionicons name="checkmark" size={20} color="#0A1F44" />
            <Text style={styles.commitBtnText}>Request {safe.name.split(' ')[0]}</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
      </GestureDetector>
    </View>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 12, 28, 0.85)',
  },
  surface: {
    backgroundColor: colors.cardSurface,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  scroll: {
    paddingBottom: 0,
  },

  /* Hero image zone — full-bleed office photograph at the top of the
     expanded sheet. Aspect-ratio sized so the entire image renders cleanly
     without zooming in further during the card → modal morph. Same visual
     weight as the swipe-card image; the rest of the screen is for content. */
  heroImageZone: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#0A1F44',
    overflow: 'hidden',
  },
  heroImageFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  heroImageEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  /* Pill grabber — swipe-down dismiss affordance, sits in the safe area
     above the brand zone */
  grabberRow: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 241, 232, 0.55)',
  },

  /* Brand band — slim, sits directly under the hero image. No status-bar
     padding here because the image (and the grabber) already occupy the
     top safe area. */
  brandZone: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: 'InstrumentSerif-Regular', fontSize: 18 },
  brandName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  brandSpacer: { flex: 1 },
  /* OPEN = green pill, brand-color independent (same as the swipe card) */
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.55)',
  },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  openText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#22C55E',
  },
  role: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  /* Cream zone wrapper */
  creamZone: { flex: 1 },

  /* Headline row — REFERRED BY (left flex:1) | YOUR MATCH (right fixed col) */
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 16,
  },
  referrerCol: {
    flex: 1,
    gap: 14,
  },
  matchCol: {
    width: 132,
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.35)',
    backgroundColor: 'rgba(212, 167, 68, 0.06)',
  },

  /* Generic section — used by ABOUT, SKILLS, WHY THIS MATCH */
  section: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 12,
  },
  sectionLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: BLACK_50,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* Referrer block (inside referrerCol). Avatar aligns to the TOP of the
     name block so it sits next to the first name, not centered between
     the two name lines. */
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  referrerMeta: { flex: 1, gap: 4 },
  referrerName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    lineHeight: 26,
    color: BLACK,
    letterSpacing: -0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: BLACK_70,
  },

  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: BLACK_05,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: BLACK,
  },
  statLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: BLACK_50,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  matchHint: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11.5,
    color: BLACK_70,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  /* Extras wrapper — fades in when surface is mostly expanded */
  extras: {
    borderTopWidth: 1,
    borderTopColor: BLACK_08,
  },

  /* Extras */
  about: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: BLACK,
    lineHeight: 24,
  },
  aboutAccent: {
    fontFamily: 'Outfit-SemiBold',
    color: '#0A1F44',
  },
  skillsExtras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillExtraChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: BLACK_05,
  },
  skillExtraText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK,
  },

  /* Close button — top-right floating, fades with surface */
  closeWrap: {
    position: 'absolute',
    top: 56,
    right: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Action bar — sits flush at the bottom, slim profile so it doesn't
     dominate the sheet. */
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 26,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.cardSurface,
    borderTopWidth: 1,
    borderTopColor: BLACK_08,
  },
  passBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.error,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  passBtnText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.error,
  },
  commitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  commitBtnText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#0A1F44',
    letterSpacing: 0.2,
  },
});
