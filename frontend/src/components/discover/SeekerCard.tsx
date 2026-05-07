import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../common/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { SwipeStamp } from './SwipeStamp';
import type { SwipeDirection } from './SwipeDeck';
import type { SeekerCard as SeekerCardData } from './seekerCardData';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.3;
const CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.64));

interface SeekerCardProps {
  card: SeekerCardData;
  isTop: boolean;
  stackIndex: number;
  onSwiped: (direction: SwipeDirection) => void;
}

/**
 * Seeker-facing card rendered in the Endorser's Discover deck.
 * Swipe right = "I want to endorse this person."
 * Swipe left = pass.
 * Card compresses the 3-second vetting decision per UX spec § P2.
 */
export function SeekerCard({ card, isTop, stackIndex, onSwiped }: SeekerCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const commitHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => onSwiped(direction),
    [onSwiped],
  );

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      const shouldCommit =
        Math.abs(translationX) > COMMIT_THRESHOLD ||
        Math.abs(velocityX) > 800;

      if (shouldCommit) {
        const direction: SwipeDirection = translationX > 0 ? 'request' : 'pass';
        const target = translationX > 0 ? FLY_OFF_X : -FLY_OFF_X;
        runOnJS(commitHaptic)();
        translateX.value = withTiming(target, { duration: 240 }, () => {
          runOnJS(finishSwipe)(direction);
        });
        translateY.value = withTiming(translateY.value + 40, { duration: 240 });
      } else {
        translateX.value = withSpring(0, { stiffness: 180, damping: 20 });
        translateY.value = withSpring(0, { stiffness: 180, damping: 20 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = 1 - stackIndex * 0.05;
      const offsetY = stackIndex * 14;
      return {
        transform: [{ translateY: offsetY }, { scale }],
        opacity: stackIndex < 3 ? 1 : 0,
      };
    }
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-15, 0, 15],
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
      <Animated.View style={[styles.card, cardStyle]}>
        {isTop ? (
          <>
            <SwipeStamp translateX={translateX} kind="request" />
            <SwipeStamp translateX={translateX} kind="pass" />

            <View style={styles.headerRow}>
              <Avatar displayName={card.name} size="lg" />
              <View style={styles.headerMeta}>
                <Text style={styles.name} numberOfLines={1}>
                  {card.name}
                </Text>
                <Text style={styles.signal} numberOfLines={1}>
                  {card.currentSignal}
                </Text>
              </View>
              <View style={styles.matchChip}>
                <Text style={styles.matchChipLabel}>MATCH</Text>
                <Text style={styles.matchChipValue}>{card.matchPercent}%</Text>
              </View>
            </View>

            <Text style={styles.headline} numberOfLines={3}>
              {card.headline}
            </Text>

            <Text style={styles.story} numberOfLines={5}>
              {card.story}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SKILLS</Text>
              <View style={styles.tagRow}>
                {card.skills.map((s) => (
                  <View key={s} style={[styles.tag, styles.tagBlue]}>
                    <Text style={[styles.tagText, styles.tagTextBlue]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>WANTS TO JOIN</Text>
              <View style={styles.tagRow}>
                {card.targetCompanies.map((c) => (
                  <View key={c} style={[styles.tag, styles.tagPurple]}>
                    <Text style={[styles.tagText, styles.tagTextPurple]}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.targetRoleRow}>
              <Text style={styles.targetRoleLabel}>Target role</Text>
              <Text style={styles.targetRoleValue}>{card.targetRole}</Text>
            </View>
          </>
        ) : (
          <View style={styles.headerRow}>
            <Avatar displayName={card.name} size="lg" />
            <View style={styles.headerMeta} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: layout.screenPaddingH,
    right: layout.screenPaddingH,
    top: 0,
    height: CARD_HEIGHT,
    backgroundColor: '#16161f',
    borderRadius: layout.cardBorderRadiusLarge,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing[3],
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerMeta: { flex: 1, gap: spacing[0.5] },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  signal: { ...typography.caption, color: colors.textSecondary },
  matchChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    alignItems: 'center',
    gap: 2,
  },
  matchChipLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  matchChipValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 18,
    lineHeight: 20,
    color: colors.text,
  },
  headline: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.2,
  },
  story: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: { gap: spacing[1.5] },
  sectionLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    borderRadius: 6,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  tagBlue: { backgroundColor: colors.tagBlue },
  tagPurple: { backgroundColor: colors.tagPurple },
  tagText: { fontFamily: 'Outfit-Medium', fontSize: 11 },
  tagTextBlue: { color: colors.tagBlueText },
  tagTextPurple: { color: colors.tagPurpleText },
  targetRoleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  targetRoleLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  targetRoleValue: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.accent,
  },
});
