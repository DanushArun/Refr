import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { CompanyIntelCard as CompanyIntelCardType } from '@refr/shared';
import { GlassCard } from '../common/GlassCard';
import { Avatar } from '../common/Avatar';
import { TagRow } from '../common/Tag';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface CompanyIntelCardProps {
  card: CompanyIntelCardType;
  onPress?: () => void;
}

/**
 * CompanyIntelCard — anonymous insider intel from verified employees.
 *
 * The "Verified employee at [Company]" byline is the trust signal.
 * Content: hiring bar, team culture, interview process, salary reality.
 * This is the epistemic hook that makes REFR necessary.
 */
export function CompanyIntelCard({ card, onPress }: CompanyIntelCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Pressable onPress={onPress} style={styles.inner}>
        {/* Verified byline */}
        <View style={styles.byline}>
          <Avatar uri={card.companyLogo} displayName={card.companyName} size="sm" />
          <View style={styles.bylineMeta}>
            <Text style={styles.verifiedBadge}>Verified employee</Text>
            <Text style={styles.companyName}>at {card.companyName}</Text>
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(card.createdAt)}</Text>
        </View>

        {/* Content headline */}
        <Text style={styles.headline}>{card.title}</Text>

        {/* Body */}
        <Text style={styles.body}>{truncate(card.body, 240)}</Text>

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <TagRow tags={card.tags} color="green" max={4} />
        )}

        {/* Engagement */}
        <View style={styles.engagement}>
          <Text style={styles.reactionCount}>{card.reactionCount} reactions</Text>
        </View>
      </Pressable>
    </GlassCard>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
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
  inner: {
    gap: spacing[3],
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
  },
  bylineMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    ...typography.caption,
    color: colors.success,
    fontFamily: 'Outfit-SemiBold',
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  headline: {
    ...typography.h3,
    color: colors.text,
    lineHeight: 26,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
