import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
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
import { brandForName } from './companyBrand';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import type { SeekerCard as SeekerCardData } from './seekerCardData';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CARD_LEFT = 20;
const CARD_WIDTH = SCREEN_W - 40;
const CARD_HEIGHT = Math.min(580, Math.round(SCREEN_H * 0.62));
const CARD_TOP_FROM_SCREEN = 60 + 8;

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_50 = 'rgba(0, 0, 0, 0.50)';
const BLACK_45 = 'rgba(0, 0, 0, 0.45)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

interface ExpandedSeekerCardProps {
  card: SeekerCardData | null;
  onClose: () => void;
  onPass: () => void;
  onCommit: () => void;
}

/**
 * Card-to-full-screen container transform — referrer side.
 * Mirrors ExpandedEndorserCard but renders seeker info as the cream content.
 */
export function ExpandedSeekerCard({
  card,
  onClose,
  onPass,
  onCommit,
}: ExpandedSeekerCardProps) {
  const progress = useSharedValue(0);
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

  // Live ScrollView offset so the dismiss Pan only takes touches when the
  // user is at the top of the content. Same pattern as ExpandedEndorserCard.
  const scrollY = useSharedValue(0);
  const dismissActive = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  /**
   * Swipe down to minimize back into the swipe deck. Composed with the
   * ScrollView's native gesture so either can drive — when the user is at
   * the top, downward drags become dismiss drags; otherwise the inner scroll
   * wins. Gentle thresholds (50px / velocity 350) so a soft pull works.
   */
  const dismissGesture = Gesture.Pan()
    .activeOffsetY(4)
    .onBegin(() => {
      dismissActive.value = scrollY.value <= 0;
    })
    .onUpdate((e) => {
      if (e.translationY <= 0) {
        if (dismissActive.value) {
          dismissActive.value = false;
          dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
        }
        return;
      }
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
      const shouldDismiss = e.translationY > 50 || e.velocityY > 350;
      if (shouldDismiss) {
        // Reset dragY so the morph-back animation plays cleanly — same
        // result path as the X button.
        dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
        runOnJS(handleClose)();
      } else {
        dragY.value = withSpring(0, { stiffness: 220, damping: 22 });
      }
    });

  // Run the ScrollView's native pan and our dismiss Pan simultaneously so
  // either can drive depending on intent.
  const composedGesture = Gesture.Simultaneous(dismissGesture, Gesture.Native());

  const surfaceStyle = useAnimatedStyle(() => {
    const t = progress.value;
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

  const backdropStyle = useAnimatedStyle(() => {
    const dragFade = Math.max(0, 1 - dragY.value / 400);
    return {
      opacity:
        interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP) *
        dragFade,
    };
  });

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

  const primaryTarget = safe.targetCompanies[0] ?? 'Bangalore';
  const brand = brandForName(primaryTarget);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.surface, surfaceStyle]}>
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
          {/* === HERO IDENTITY — full-bleed, the seeker IS the desire driver === */}
          <View style={[styles.identityHero, { backgroundColor: brand.tint }]}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']}
              style={styles.identityHeroShade}
              pointerEvents="none"
            />
            <View style={styles.identityHeroContent}>
              <Avatar displayName={safe.name} size="xl" verificationRing />
              <PersonName
                name={safe.name}
                textStyle={[styles.heroName, { color: brand.text }]}
                containerStyle={styles.heroNameWrap}
              />
              <Text
                style={[styles.heroSignal, { color: brand.text }]}
                numberOfLines={1}
              >
                {safe.currentSignal}
              </Text>
            </View>
          </View>

          {/* Slim band — target company + role */}
          <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
            <View style={styles.brandRow}>
              <View style={[styles.brandMark, { borderColor: brand.accent }]}>
                <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
              </View>
              <Text style={[styles.brandName, { color: brand.text }]} numberOfLines={1}>
                {primaryTarget}
              </Text>
              <View style={styles.brandSpacer} />
              <View style={styles.matchPill}>
                <Text style={styles.matchPillValue}>{safe.matchPercent}</Text>
                <Text style={styles.matchPillLabel}>MATCH</Text>
              </View>
            </View>
            <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
              {safe.targetRole}
            </Text>
          </View>

          <View style={styles.creamZone}>
            {/* Headline — their pitch (no longer redundant since avatar+name
                 already live in the hero zone above) */}
            <View style={styles.headlineSection}>
              <Text style={styles.headlineQuote}>“</Text>
              <Text style={styles.headlineText}>{safe.headline}</Text>
            </View>

            {/* Extras crossfade in once mostly expanded */}
            <Animated.View style={extrasStyle}>
              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>CAREER STORY</Text>
                <Text style={styles.story}>{safe.fullStory}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SKILLS</Text>
                <View style={styles.skillsExtras}>
                  {safe.fullSkills.map((s) => (
                    <View key={s} style={styles.skillExtraChip}>
                      <Text style={styles.skillExtraText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TARGET ROLES</Text>
                <View style={styles.skillsExtras}>
                  {safe.targetRoles.map((r) => (
                    <View key={r} style={styles.skillExtraChip}>
                      <Text style={styles.skillExtraText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>WANTS TO JOIN</Text>
                <View style={styles.skillsExtras}>
                  {safe.targetCompanies.map((c) => (
                    <View key={c} style={styles.skillExtraChip}>
                      <Text style={styles.skillExtraText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            <View style={{ height: 96 }} />
          </View>
        </Animated.ScrollView>

        <Animated.View style={[styles.closeWrap, closeStyle]} pointerEvents="box-none">
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.actionBar, extrasStyle]}>
          <Pressable
            onPress={() => {
              // Mirror the gesture haptic so tap-in-modal pass feels identical
              // to swipe-pass — the "soft sigh" cadence is the dismissal beat.
              Phrase.swipePass();
              onPass();
            }}
            style={styles.passBtn}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <Text style={styles.passBtnText}>Pass</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              // Heartbeat phrase — confirms the press; the parent fires the
              // full match cadence + Skia burst on commit.
              Phrase.swipeRequest();
              onCommit();
            }}
            style={styles.commitBtn}
          >
            <Ionicons name="checkmark" size={20} color="#0A1F44" />
            <Text style={styles.commitBtnText}>Accept {safe.name.split(' ')[0]}</Text>
          </Pressable>
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
  scroll: { paddingBottom: 0 },

  /* Identity hero — full-width, the seeker's avatar + name + signal sits
     at the top of the sheet (replaces the office-image hero used by the
     seeker-side ExpandedEndorserCard). */
  identityHero: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: '#0A1F44',
  },
  identityHeroShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  identityHeroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  heroNameWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  heroName: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSignal: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    textAlign: 'center',
  },

  /* Slim band — target company + role, sits directly under the hero */
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
  matchPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    alignItems: 'center',
    minWidth: 64,
  },
  matchPillValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  matchPillLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.4,
    marginTop: -1,
  },
  role: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  creamZone: {
    flex: 1,
  },

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

  // candidateBlock / candidateMeta / candidateName / candidateSignal removed
  // — the avatar + name + signal now live in the identity hero zone above.

  divider: {
    height: 1,
    backgroundColor: BLACK_08,
    marginHorizontal: 28,
  },

  headlineSection: {
    paddingHorizontal: 28,
    paddingVertical: 22,
    flexDirection: 'row',
    gap: 10,
  },
  headlineQuote: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 44,
    color: BLACK_45,
    lineHeight: 32,
  },
  headlineText: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 22,
    color: BLACK,
    lineHeight: 30,
  },

  story: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: BLACK,
    lineHeight: 24,
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

  /* Pill grabber — swipe-down dismiss affordance */
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

  /* Slim action bar — same dimensions as the seeker-side ExpandedEndorserCard
     so both expanded sheets feel identical in their commit UX. */
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
