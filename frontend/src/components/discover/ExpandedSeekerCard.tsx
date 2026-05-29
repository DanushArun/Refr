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
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import type { SeekerCard as SeekerCardData } from './seekerCardData';
import {
  ExpandedCardActions,
  expandedActionStyles,
} from './ExpandedCardActions';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CARD_LEFT = 20;
const CARD_WIDTH = SCREEN_W - 40;
const CARD_HEIGHT = Math.min(580, Math.round(SCREEN_H * 0.62));
const CARD_TOP_FROM_SCREEN = 60 + 8;
const EXPANDED_LEFT = 14;
const EXPANDED_MIN_EDGE = 34;
const EXPANDED_SAFE_GAP = 10;
const EXPANDED_WIDTH = SCREEN_W - EXPANDED_LEFT * 2;

const BLACK = '#000000';
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
 * Card-to-expanded container transform — referrer side.
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
    Phrase.swipePass();
    onPass();
  };

  const handleCommit = () => {
    Phrase.swipeRequest();
    onCommit();
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

  const primaryTarget = safe.targetCompanies[0] ?? 'India';
  const roleLine = `${safe.targetRole} · ${primaryTarget}`;
  const proofLine = candidateProofLine(safe);

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
          <View style={styles.identityHero}>
            <Image
              source={{ uri: safe.photoUrl }}
              style={styles.identityPhoto}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                'rgba(1, 7, 17, 0)',
                'rgba(1, 7, 17, 0.52)',
                'rgba(1, 7, 17, 0.86)',
                'rgba(1, 7, 17, 0.98)',
              ]}
              locations={[0.44, 0.58, 0.76, 1]}
              style={styles.identityHeroShade}
              pointerEvents="none"
            />
          </View>

          <View style={styles.summaryPanel}>
            <View style={styles.heroTitleRow}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.84}
                numberOfLines={2}
                style={styles.heroName}
              >
                {safe.name}
              </Text>
              <View style={styles.expChip}>
                <Text style={styles.expChipText}>{safe.yearsOfExperience}Y EXP</Text>
              </View>
            </View>

            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.86}
              style={styles.heroRole}
              numberOfLines={1}
            >
              {roleLine}
            </Text>
            <Text numberOfLines={2} style={styles.heroProof}>{proofLine}</Text>
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

            <View style={expandedActionStyles.contentSpacer} />
          </View>
        </Animated.ScrollView>

        <Animated.View style={[styles.closeWrap, closeStyle]} pointerEvents="box-none">
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <Animated.View style={[expandedActionStyles.actionBar, extrasStyle]}>
          <ExpandedCardActions
            commitLabel="Endorse candidate"
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

function candidateProofLine(card: SeekerCardData): string {
  const firstSentence = card.headline.split('.')[0]?.trim();
  if (!firstSentence) return card.currentSignal;
  const match = firstSentence.match(/^(.+?)\s+at\s+(.+)$/i);
  if (!match) return firstSentence;
  return [
    shortCompany(match[2]),
    shortRole(match[1]),
    'targeting',
    roleFamily(card.targetRole),
    'referrals.',
  ].join(' ');
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

  identityHero: {
    width: '100%',
    aspectRatio: 1.12,
    overflow: 'hidden',
    backgroundColor: '#0A1F44',
  },
  identityPhoto: {
    width: '100%',
    height: '100%',
  },
  identityHeroShade: {
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
    gap: 9,
    borderWidth: 1,
    borderColor: 'rgba(245, 241, 232, 0.08)',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroName: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 36,
    lineHeight: 40,
    color: colors.cream,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  expChip: {
    minWidth: 78,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.42)',
  },
  expChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.goldBright,
  },
  heroRole: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 21,
    color: 'rgba(245, 241, 232, 0.78)',
  },
  heroProof: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    lineHeight: 21,
    color: colors.goldBright,
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

});
