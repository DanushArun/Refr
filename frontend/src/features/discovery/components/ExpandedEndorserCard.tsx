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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Avatar } from '../../../components/common/Avatar';
import { getCompanyBrand } from './companyBrand';
import { officeImageFor } from '../../../components/activity/companyOffices';
import { Phrase } from '../../../utils/haptics';
import { colors } from '../../../theme/colors';
import type { EndorserCard as EndorserCardData } from './endorserCardData';
import {
  ExpandedCardActions,
  expandedActionStyles,
} from './ExpandedCardActions';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// These constants must match EndorserCard's swipe-deck position so the
// expansion springs out of the EXACT card the user tapped.
const CARD_LEFT = 20;
const CARD_WIDTH = SCREEN_W - 40;
const CARD_HEIGHT = Math.min(580, Math.round(SCREEN_H * 0.62));
// The deck starts roughly below the header (60) + filter row (54) + a 8px
// breathing gap. Adjust if those header heights change in swipe discovery screen.
const CARD_TOP_FROM_SCREEN = 60 + 54 + 8;
const EXPANDED_LEFT = 14;
const EXPANDED_MIN_EDGE = 34;
const EXPANDED_SAFE_GAP = 10;
const EXPANDED_WIDTH = SCREEN_W - EXPANDED_LEFT * 2;

const BLACK = '#000000';
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
 * Card-to-expanded container transform.
 *
 * On mount the card animates from its swipe-deck rect into an inset detail
 * card. The brand-zone hero stays in place visually while extra detail
 * sections fade in underneath as the surface grows.
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
  const insets = useSafeAreaInsets();
  const expandedTop = Math.max(EXPANDED_MIN_EDGE, insets.top + EXPANDED_SAFE_GAP);
  const expandedBottom = Math.max(EXPANDED_MIN_EDGE, insets.bottom + EXPANDED_SAFE_GAP);
  const expandedHeight = SCREEN_H - expandedTop - expandedBottom;

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
      left: interpolate(t, [0, 1], [CARD_LEFT, EXPANDED_LEFT], Extrapolation.CLAMP),
      top: interpolate(t, [0, 1], [CARD_TOP_FROM_SCREEN, expandedTop], Extrapolation.CLAMP),
      width: interpolate(t, [0, 1], [CARD_WIDTH, EXPANDED_WIDTH], Extrapolation.CLAMP),
      height: interpolate(t, [0, 1], [CARD_HEIGHT, expandedHeight], Extrapolation.CLAMP),
      borderRadius: interpolate(t, [0, 1], [32, 34], Extrapolation.CLAMP),
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
  const metaLine = `${safe.hires} hires · ${safe.responseTime} reply`;

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
            <LinearGradient
              colors={[
                'rgba(1, 7, 17, 0)',
                'rgba(1, 7, 17, 0.52)',
                'rgba(1, 7, 17, 0.86)',
                'rgba(1, 7, 17, 0.98)',
              ]}
              locations={[0.44, 0.58, 0.76, 1]}
              style={styles.heroImageShade}
              pointerEvents="none"
            />
          </View>

          <View style={styles.summaryPanel}>
            <View style={styles.heroTitleRow}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.84}
                numberOfLines={1}
                style={styles.companyTitle}
              >
                {safe.companyName}
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
              {safe.jobTitle}
            </Text>

            <View style={styles.endorserProofRow}>
              <Avatar
                displayName={safe.name}
                size="sm"
                uri={safe.avatarUrl}
                verificationRing
              />
              <Text style={styles.endorserProofText} numberOfLines={2}>
                {safe.name} can endorse this role.
              </Text>
            </View>

            <Text style={styles.endorserMetaLine} numberOfLines={1}>
              {metaLine}
            </Text>
          </View>

          <View style={styles.creamZone}>
            {/* === Extras — fade in once surface is mostly expanded === */}
            <Animated.View style={[styles.extras, extrasStyle]}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ABOUT</Text>
                <Text style={styles.about}>
                  Works at <Text style={styles.aboutAccent}>{safe.companyName}</Text> as
                  a {safe.jobTitle}. Typical response time is {safe.responseTime}.
                  Has endorsed {safe.hires} successful hire{safe.hires === 1 ? '' : 's'}
                  {' '}to date. Selects {safe.acceptanceRate}% of incoming requests
                  and prioritizes strong context over volume.
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
                <Text style={styles.sectionLabel}>WHY THIS ENDORSER</Text>
                <Text style={styles.about}>
                  {safe.name.split(' ')[0]} works at{' '}
                  <Text style={styles.aboutAccent}>{safe.companyName}</Text>, endorses
                  for {safe.skills.slice(0, 2).join(' and ')}, and has {safe.hires}
                  {' '}confirmed hire{safe.hires === 1 ? '' : 's'}.
                </Text>
              </View>
            </Animated.View>

            <View style={expandedActionStyles.contentSpacer} />
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
        <Animated.View style={[expandedActionStyles.actionBar, extrasStyle]}>
          <ExpandedCardActions
            commitLabel="Request endorsement"
            onPass={handlePass}
            onCommit={handleCommit}
          />
        </Animated.View>
      </Animated.View>
      </GestureDetector>
    </View>
    </Modal>
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
    aspectRatio: 1.12,
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
    ...StyleSheet.absoluteFillObject,
  },
  summaryPanel: {
    marginTop: -42,
    marginHorizontal: 14,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.navyDeep,
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 241, 232, 0.08)',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  companyTitle: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 40,
    lineHeight: 45,
    color: colors.cream,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verifiedChip: {
    minWidth: 96,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.42)',
  },
  verifiedChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    letterSpacing: 0.9,
    color: colors.goldBright,
  },
  companyRole: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 30,
    lineHeight: 35,
    color: colors.cream,
  },
  endorserProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
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
    fontSize: 16,
    lineHeight: 21,
    color: 'rgba(245, 241, 232, 0.76)',
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

  /* Cream zone wrapper */
  creamZone: { flex: 1 },

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

});
