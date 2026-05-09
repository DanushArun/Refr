import React, { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../common/Avatar';
import { MatchArc } from './MatchArc';
import { brandForName } from './companyBrand';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { SwipeStamp } from './SwipeStamp';
import type { SwipeDirection } from './SwipeDeck';
import type { SeekerCard as SeekerCardData } from './seekerCardData';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.4;
const SWIPE_OUT_MS = 220;
const CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.62));

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_50 = 'rgba(0, 0, 0, 0.50)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

interface SeekerCardProps {
  card: SeekerCardData;
  isTop: boolean;
  stackIndex: number;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
}

export function SeekerCard({ card, isTop, stackIndex, onSwiped, onTap }: SeekerCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const playRequest = useCallback(() => Phrase.swipeRequest(), []);
  const playPass = useCallback(() => Phrase.swipePass(), []);
  const playStampReveal = useCallback(() => Phrase.stampReveal(), []);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => onSwiped(direction),
    [onSwiped],
  );

  const stampPlayed = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
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
        const target = translationX > 0 ? FLY_OFF_X : -FLY_OFF_X;
        if (direction === 'request') runOnJS(playRequest)();
        else runOnJS(playPass)();
        translateX.value = withTiming(
          target,
          { duration: SWIPE_OUT_MS, easing: Easing.in(Easing.quad) },
          () => {
            runOnJS(finishSwipe)(direction);
          },
        );
        translateY.value = withTiming(translateY.value + 28, { duration: SWIPE_OUT_MS });
      } else {
        stampPlayed.value = 0;
        translateX.value = withSpring(0, { stiffness: 320, damping: 26 });
        translateY.value = withSpring(0, { stiffness: 320, damping: 26 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = 1 - stackIndex * 0.05;
      const offsetY = stackIndex * 14;
      const offsetX = stackIndex === 1 ? -22 : stackIndex === 2 ? 22 : 0;
      const rotateDeg = stackIndex === 1 ? -4 : stackIndex === 2 ? 4 : 0;
      const opacity = stackIndex === 1 ? 0.88 : stackIndex === 2 ? 0.62 : 1;
      return {
        transform: [
          { translateY: offsetY },
          { translateX: offsetX },
          { rotate: `${rotateDeg}deg` },
          { scale },
        ],
        opacity,
      };
    }
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <View style={styles.ambientShadow} />

        <View style={styles.surface}>
          {isTop && (
            <>
              <SwipeStamp translateX={translateX} kind="request" />
              <SwipeStamp translateX={translateX} kind="pass" />
            </>
          )}

          <Pressable onPress={isTop ? onTap : undefined} style={styles.tapArea}>
            {isTop ? <TopCardContent card={card} /> : <StackPreview card={card} />}
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

function StackPreview(_: { card: SeekerCardData }) {
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

  /* Stack preview — anonymous navy plate, no identity content */
  stackPlate: {
    flex: 1,
    backgroundColor: '#0A1F44',
  },

  /* Credit-card material overlays */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
});
