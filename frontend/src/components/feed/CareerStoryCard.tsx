import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import type { CareerStoryCard as CareerStoryCardType } from '@refr/shared';
import { GlassCard } from '../common/GlassCard';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { TagRow } from '../common/Tag';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface CareerStoryCardProps {
  card: CareerStoryCardType;
  onReferPress: (card: CareerStoryCardType) => void;
  onCardPress?: (card: CareerStoryCardType) => void;
}

/**
 * CareerStoryCard — the core conversion card in the REFR feed.
 *
 * Shows a seeker's narrative headline and story excerpt. The "I can refer" CTA
 * (violet primary button) is the referral entry point — a referrer tapping it
 * triggers a referral request. Scrollers who can't refer still see the seeker's
 * story and can bookmark.
 *
 * Layout: avatar + meta → headline (Instrument Serif) → story excerpt →
 *         skill tags → target roles/companies → CTA row
 */
export function CareerStoryCard({ card, onReferPress, onCardPress }: CareerStoryCardProps) {
  const handleReferPress = useCallback(() => {
    onReferPress(card);
  }, [card, onReferPress]);

  const handleCardPress = useCallback(() => {
    onCardPress?.(card);
  }, [card, onCardPress]);

  // Truncate story to ~3 lines
  const storyExcerpt =
    card.story.length > 160 ? `${card.story.slice(0, 157)}...` : card.story;

  return (
    <GlassCard style={styles.card}>
      {/* Header row */}
      <Pressable onPress={handleCardPress} style={styles.header}>
        <Avatar
          uri={card.seekerAvatar}
          displayName={card.seekerName}
          size="md"
        />
        <View style={styles.headerMeta}>
          <Text style={styles.seekerName}>{card.seekerName}</Text>
          <Text style={styles.yearsExp}>
            {card.yearsOfExperience}y exp · seeking referral
          </Text>
        </View>
        <View style={styles.reactionCount}>
          <Text style={styles.reactionText}>{card.reactionCount}</Text>
          <Text style={styles.reactionIcon}>+</Text>
        </View>
      </Pressable>

      {/* Headline — Instrument Serif, the emotional hook */}
      <Pressable onPress={handleCardPress}>
        <Text style={styles.headline}>{card.headline}</Text>
      </Pressable>

      {/* Story excerpt */}
      <Pressable onPress={handleCardPress}>
        <Text style={styles.story}>{storyExcerpt}</Text>
      </Pressable>

      {/* Skills */}
      {card.skills.length > 0 && (
        <View style={styles.section}>
          <TagRow tags={card.skills} color="blue" max={5} />
        </View>
      )}

      {/* Target companies */}
      {card.targetCompanies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Wants to join</Text>
          <TagRow tags={card.targetCompanies} color="purple" max={3} />
        </View>
      )}

      {/* CTA row */}
      <View style={styles.ctaRow}>
        <Button
          label="I can refer"
          onPress={handleReferPress}
          variant="primary"
          size="medium"
          fullWidth={false}
          style={styles.referButton}
        />
        <TouchableOpacity style={styles.bookmarkButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.bookmarkIcon}>{card.isBookmarked ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerMeta: {
    flex: 1,
  },
  seekerName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  yearsExp: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  reactionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reactionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  reactionIcon: {
    fontSize: 14,
    color: colors.success,
    fontFamily: 'Outfit-Bold',
  },
  headline: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
    letterSpacing: -0.3,
  },
  story: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing[1.5],
  },
  sectionLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  referButton: {
    paddingHorizontal: spacing[6],
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: 22,
    color: colors.textSecondary,
  },
});
