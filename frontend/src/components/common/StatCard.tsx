import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  /** Accent color for the value — defaults to white */
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * StatCard — earnings and score stat display.
 *
 * Uses JetBrains Mono for the numeric value to convey precision and professionalism.
 * Used on EarningsScreen for Kingmaker Score, total earnings, and hire counts.
 */
export function StatCard({ label, value, subLabel, valueColor, style }: StatCardProps) {
  return (
    <GlassCard padding="default" style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </GlassCard>
  );
}

/**
 * StatRow — horizontal row of two or three StatCards.
 */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
  },
  label: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing[1.5],
  },
  value: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 26,
    color: colors.text,
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  subLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing[0.5],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
