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
import type { EndorserCard as EndorserCardData } from './endorserCardData';
import { TierBadge } from '../tier/TierBadge';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.3;

// Cards are a consistent rectangle. Sized for iPhone 14 Pro / 15, scales down.
const CARD_HEIGHT = Math.min(560, Math.round(WINDOW_HEIGHT * 0.62));

interface EndorserCardProps {
  card: EndorserCardData;
  /** True only for the top card — only this one responds to gestures. */
  isTop: boolean;
  /** Stack position 0 = top, 1 = behind, 2 = further behind. Drives scale. */
  stackIndex: number;
  /** Fires after the card flies off screen. */
  onSwiped: (direction: SwipeDirection) => void;
}

export function EndorserCard({ card, isTop, stackIndex, onSwiped }: EndorserCardProps) {
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

  // Top-card transform follows the gesture; behind cards are offset + scaled.
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
        {/* Behind cards render an empty shell — no content bleed */}
        {isTop ? (
          <>
            <SwipeStamp translateX={translateX} kind="request" />
            <SwipeStamp translateX={translateX} kind="pass" />

            <View style={styles.row}>
              <Avatar displayName={card.name} size="lg" />
              <View style={styles.headMeta}>
                <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
                <Text style={styles.role} numberOfLines={1}>{card.jobTitle}</Text>
                <Text style={styles.company} numberOfLines={1}>
                  {card.companyName} · Bangalore
                </Text>
              </View>
              <TierBadge score={card.trustScore} size="md" />
            </View>

            <View style={styles.verifiedRow}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText} numberOfLines={1}>
                Verified employee at {card.companyName}
              </Text>
            </View>

            <View style={styles.statGrid}>
              <StatCell label="Response" value={card.responseTime} />
              <StatCell label="Accepts" value={`${card.acceptanceRate}%`} />
              <StatCell label="Hires" value={String(card.hires)} />
            </View>

            <View style={styles.skills}>
              {card.skills.map((s) => (
                <View key={s} style={styles.skill}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.matchRow}>
              <Text style={styles.matchLabel}>MATCH</Text>
              <View style={styles.matchBar}>
                <View
                  style={[styles.matchFill, { width: `${card.matchPercent}%` }]}
                />
              </View>
              <Text style={styles.matchPercent}>{card.matchPercent}%</Text>
            </View>
          </>
        ) : (
          // Empty shell with a single anchored avatar for visual continuity
          <View style={styles.row}>
            <Avatar displayName={card.name} size="lg" />
            <View style={styles.headMeta} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    gap: spacing[4],
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  headMeta: { flex: 1, gap: spacing[0.5] },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  role: { ...typography.body, color: colors.textSecondary },
  company: { ...typography.caption, color: colors.accent },
  trustChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    alignItems: 'center',
    gap: 2,
  },
  trustLabel: {
    ...typography.caption,
    color: colors.accent,
    letterSpacing: 0.5,
    fontSize: 9,
  },
  trustValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
    lineHeight: 22,
    color: colors.text,
  },
  trustDenom: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  verifiedText: { ...typography.caption, color: colors.success, flex: 1 },
  statGrid: { flexDirection: 'row', gap: spacing[3] },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceInset,
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontFamily: 'JetBrainsMono-Medium', fontSize: 16, color: colors.text },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  skill: {
    backgroundColor: colors.tagBlue,
    borderRadius: 6,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  skillText: { ...typography.caption, color: colors.tagBlueText, fontFamily: 'Outfit-Medium' },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  matchLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.6,
    fontSize: 10,
  },
  matchBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  matchFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  matchPercent: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
    color: colors.text,
  },
});
