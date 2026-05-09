import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../common/Avatar';
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

  /**
   * Swipe down anywhere on the expanded card to minimize back to the deck.
   * Only activates after a clear 15px downward drag. Upward motion fails
   * the gesture so the inner ScrollView can still scroll content. Released
   * past 120px or with velocity > 800 → commits the close. Otherwise springs
   * back to the expanded position.
   */
  const dismissGesture = Gesture.Pan()
    .activeOffsetY(15)
    .failOffsetY([-15, 0])
    .onUpdate((e) => {
      if (e.translationY > 0) {
        dragY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      const shouldDismiss = e.translationY > 120 || e.velocityY > 800;
      if (shouldDismiss) {
        runOnJS(handleClose)();
      } else {
        dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
      }
    });

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

      <GestureDetector gesture={dismissGesture}>
      <Animated.View style={[styles.surface, surfaceStyle]}>
        {/* Pill grabber centered at top — affordance hint for swipe-down */}
        <View style={styles.grabberRow} pointerEvents="none">
          <View style={styles.grabber} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* === HERO IMAGE — full-bleed office photo, the desire-driver === */}
          <View style={styles.heroImageZone}>
            <View style={[styles.heroImageFallback, { backgroundColor: brand.tint }]} />
            {officeImage && (
              <Image
                source={{ uri: officeImage }}
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

          {/* Brand zone — same hero as the swipe card */}
          <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { borderColor: brand.accent }]}>
                <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
              </View>
              <Text style={[styles.brandName, { color: brand.text }]}>{safe.companyName}</Text>
              <View style={styles.brandSpacer} />
              <View style={[styles.openTag, { borderColor: brand.accent }]}>
                <View style={[styles.openDot, { backgroundColor: brand.accent }]} />
                <Text style={[styles.openText, { color: brand.accent }]}>OPEN</Text>
              </View>
            </View>
            <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
              {safe.jobTitle}
            </Text>
            <View style={styles.skillsRow}>
              {safe.skills.slice(0, 3).map((s) => (
                <View key={s} style={styles.skillChip}>
                  <Text style={[styles.skillText, { color: brand.text }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.creamZone}>
            {/* Referrer hero — identical to swipe card */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>REFERRED BY</Text>
              <View style={styles.referrerCard}>
                <Avatar displayName={safe.name} size="xl" verificationRing />
                <View style={styles.referrerMeta}>
                  <Text style={styles.referrerName} numberOfLines={1}>{safe.name}</Text>
                  <Text style={styles.referrerTitle} numberOfLines={1}>
                    Verified at {safe.companyName}
                  </Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <Stat label="Trust" value={`★ ${safe.trustScore}`} />
                <Stat label="Hires" value={`${safe.hires}`} />
                <Stat label="Reply" value={safe.responseTime} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Match — identical to swipe card */}
            <View style={styles.matchSection}>
              <View style={styles.matchHeader}>
                <Text style={styles.sectionLabel}>YOUR MATCH</Text>
                <Text style={styles.matchHint} numberOfLines={2}>
                  Skill overlap, target fit, and {safe.companyName}'s acceptance rate
                </Text>
              </View>
              <MatchArc percent={safe.matchPercent} size={92} animate light />
            </View>

            {/* Extras — only visible once the surface has mostly expanded */}
            <Animated.View style={extrasStyle}>
              <View style={styles.divider} />

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

              <View style={styles.divider} />

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

              <View style={styles.divider} />

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
            <View style={{ height: 96 }} />
          </View>
        </ScrollView>

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
     expanded sheet. Taller than the swipe-card's image (320px vs ~45% of
     card height) so it reads as the magazine-cover hero on the detail view. */
  heroImageZone: {
    width: '100%',
    height: 320,
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

  /* Brand zone — generous breathing room when expanded; status-bar safe top.
     No perimeter border in the expanded view — borders are only on the
     compact swipe card. */
  brandZone: {
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 32,
    gap: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: 'InstrumentSerif-Regular', fontSize: 22 },
  brandName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  brandSpacer: { flex: 1 },
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontFamily: 'Outfit-Bold', fontSize: 10, letterSpacing: 1.5 },
  role: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  skillText: { fontFamily: 'Outfit-Medium', fontSize: 13 },

  /* Cream zone wrapper — no perimeter border when expanded */
  creamZone: {
    flex: 1,
  },

  /* Section — generic for referrer / about / extras */
  section: {
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 22,
    gap: 16,
  },
  sectionLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    color: BLACK_50,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },

  /* Referrer hero block */
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  referrerMeta: { flex: 1, gap: 4 },
  referrerName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: BLACK,
    letterSpacing: -0.4,
  },
  referrerTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: BLACK_70,
  },

  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: BLACK_05,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 17,
    color: BLACK,
  },
  statLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: BLACK_50,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  divider: {
    height: 1,
    backgroundColor: BLACK_08,
    marginHorizontal: 28,
  },

  /* Match — more spacious horizontal layout */
  matchSection: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  matchHeader: { flex: 1, gap: 8 },
  matchHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: BLACK_70,
    lineHeight: 20,
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

  /* Action bar — sits flush at the bottom */
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 32,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.cardSurface,
    borderTopWidth: 1,
    borderTopColor: BLACK_08,
  },
  passBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.4,
    borderColor: colors.error,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  passBtnText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.error,
  },
  commitBtn: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  commitBtnText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 15,
    color: '#0A1F44',
    letterSpacing: 0.2,
  },
});
