import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { nextTier, pointsToNextTier, progressToNextTier, tierForScore } from './tiers';
import { TierBadge } from './TierBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface TierProgressProps {
  score: number;
  /** Inline (compact bar + label) or full (bar + next tier callout) */
  variant?: 'inline' | 'full';
}

/**
 * Visualizes where an Endorser is on the tier ladder.
 *  inline: [Gold] ▓▓▓░░  13 → Platinum
 *  full:   fuller layout with current/next labels and a meaningful progress bar.
 */
export function TierProgress({ score, variant = 'full' }: TierProgressProps) {
  const current = tierForScore(score);
  const next = nextTier(score);
  const pct = progressToNextTier(score);
  const remaining = pointsToNextTier(score);

  if (variant === 'inline') {
    return (
      <View style={styles.inlineWrap}>
        <TierBadge score={score} size="sm" />
        <View style={styles.inlineBar}>
          <View
            style={[
              styles.inlineFill,
              { width: `${pct * 100}%`, backgroundColor: current.glow },
            ]}
          />
        </View>
        {next ? (
          <Text style={styles.inlineHint}>
            <Text style={{ color: next.color }}>{remaining}</Text>{' '}
            <Text style={{ color: colors.textTertiary }}>→ {next.name}</Text>
          </Text>
        ) : (
          <Text style={[styles.inlineHint, { color: current.color }]}>MAX TIER</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.fullWrap}>
      <View style={styles.fullHead}>
        <TierBadge score={score} size="md" />
        {next && (
          <Text style={styles.nextLabel}>
            Next: <Text style={{ color: next.color, fontFamily: 'Outfit-Bold' }}>{next.name}</Text>
          </Text>
        )}
      </View>

      <View style={styles.fullBar}>
        <View
          style={[
            styles.fullFill,
            { width: `${pct * 100}%`, backgroundColor: current.glow },
          ]}
        />
        {/* Track markers for traversed tier starts within the current→next span */}
      </View>

      <View style={styles.fullFooter}>
        <Text style={styles.footNum}>{score}</Text>
        {next ? (
          <Text style={styles.footHint}>
            <Text style={{ color: next.color, fontFamily: 'JetBrainsMono-Medium' }}>{remaining}</Text>{' '}
            <Text style={{ color: colors.textSecondary }}>pts to {next.name}</Text>
          </Text>
        ) : (
          <Text style={[styles.footHint, { color: current.color }]}>
            Top tier. Keep it alive — decay starts after 14 days idle.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Inline variant */
  inlineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  inlineBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  inlineFill: { height: '100%', borderRadius: 2 },
  inlineHint: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
  },

  /* Full variant */
  fullWrap: { gap: spacing[2] },
  fullHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  fullBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  fullFill: { height: '100%', borderRadius: 4 },
  fullFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  footNum: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  footHint: { ...typography.caption, color: colors.textSecondary },
});
