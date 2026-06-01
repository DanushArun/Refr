import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import type { ReferralEventCard as ReferralEventCardType } from '@refr/shared';
import { GlassCard } from '../common/GlassCard';
import { DotMatrixField } from '../common/DotMatrixField';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ReferralEventCardProps {
  card: ReferralEventCardType;
}

/**
 * ReferralEventCard — live social proof in the feed.
 *
 * Shows community activity: referrals submitted, hires confirmed.
 * Creates the "others are using this" ambient signal (Cialdini social proof).
 * For hires: triggers the helper's high celebration in the referrer.
 */
export function ReferralEventCard({ card }: ReferralEventCardProps) {
  const signalProgress = eventSignalProgress(card.eventDescription);

  return (
    <Animated.View entering={FadeIn.duration(260).reduceMotion(ReduceMotion.System)}>
      <GlassCard style={styles.card}>
        <DotMatrixField
          variant="progress"
          progress={signalProgress}
          tone="dark"
          cellSize={8}
          dotRadius={0.8}
          style={styles.signalStamp}
        />
        <View style={styles.inner}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>→</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.headline}>
              {card.referrerDisplayName} endorsed {card.seekerDisplayName} for {card.companyName}
            </Text>
            <Text style={styles.meta}>
              {card.eventDescription} · {formatTimeAgo(card.createdAt)}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function eventSignalProgress(description: string): number {
  return /hired|converted|joined|accepted/i.test(description) ? 0.82 : 0.46;
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  signalStamp: {
    position: 'absolute',
    top: 8,
    right: 0,
    bottom: 8,
    width: 96,
    opacity: 0.52,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    color: colors.success,
  },
  content: {
    flex: 1,
    gap: spacing[1.5],
  },
  headline: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
  },
});
