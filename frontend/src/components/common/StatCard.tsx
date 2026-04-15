import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  label,
  value,
  subLabel,
  valueColor,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text
        style={[styles.value, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </View>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 28,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
