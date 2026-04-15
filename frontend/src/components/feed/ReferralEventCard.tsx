import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ReferralEventCard as ReferralEventCardType } from '@refr/shared';
import { GlassCard } from '../common/GlassCard';
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
  return (
    <GlassCard style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>→</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.headline}>
            {card.referrerDisplayName} referred {card.seekerDisplayName} to {card.companyName}
          </Text>
          <Text style={styles.meta}>
            {card.eventDescription} · {formatTimeAgo(card.createdAt)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
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
  cardHire: {
    backgroundColor: colors.successLight,
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
  celebration: {
    ...typography.bodySmall,
    color: colors.success,
    fontFamily: 'Outfit-Medium',
  },
  meta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
  },
});
