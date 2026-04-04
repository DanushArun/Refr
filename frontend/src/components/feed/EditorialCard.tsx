import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { EditorialCard as EditorialCardType } from '@refr/shared';
import { GlassCard } from '../common/GlassCard';
import { TagRow } from '../common/Tag';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface EditorialCardProps {
  card: EditorialCardType;
  onPress?: () => void;
}

/**
 * EditorialCard -- curated REFR content in the feed.
 *
 * Shows market insights, career advice, and editorial pieces
 * from the REFR editorial team. These cards provide the
 * epistemic value that makes the feed worth doom-scrolling.
 */
export function EditorialCard({ card, onPress }: EditorialCardProps) {
  return (
    <GlassCard style={styles.card}>
      <Pressable onPress={onPress} style={styles.inner}>
        <View style={styles.badgeRow}>
          <View style={styles.editorialBadge}>
            <Text style={styles.badgeText}>EDITORIAL</Text>
          </View>
          <Text style={styles.author}>{card.author}</Text>
        </View>

        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.body}>{truncate(card.body, 200)}</Text>

        {card.tags && card.tags.length > 0 && (
          <TagRow tags={card.tags} color="orange" max={4} />
        )}

        <Text style={styles.reactions}>{card.reactionCount} reactions</Text>
      </Pressable>
    </GlassCard>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  inner: { gap: spacing[3] },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  editorialBadge: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[0.5],
    borderRadius: 6,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
    letterSpacing: 1,
    fontSize: 10,
  },
  author: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    lineHeight: 28,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reactions: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
