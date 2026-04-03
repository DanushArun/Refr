import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { VerificationStatus } from '@refr/shared';

type BadgeVariant = 'verified' | 'pending' | 'failed' | 'status';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  /** For variant='status', provide explicit colors */
  statusColor?: string;
  style?: StyleProp<ViewStyle>;
}

const verificationConfig: Record<
  Exclude<BadgeVariant, 'status'>,
  { label: string; bg: string; textColor: string; dot?: string }
> = {
  verified: {
    label: 'Verified',
    bg: colors.successLight,
    textColor: colors.success,
    dot: colors.success,
  },
  pending: {
    label: 'Pending',
    bg: colors.warningLight,
    textColor: colors.warning,
    dot: colors.warning,
  },
  failed: {
    label: 'Failed',
    bg: colors.errorLight,
    textColor: colors.error,
    dot: colors.error,
  },
};

/**
 * Badge — compact status indicator.
 *
 * verified / pending / failed — for verification status on referrer profiles.
 * status   — freeform label with caller-provided color (used for referral states).
 */
export function Badge({ variant, label, statusColor, style }: BadgeProps) {
  if (variant === 'status') {
    const bg = statusColor ? `${statusColor}26` : colors.surface; // 15% opacity
    const text = statusColor ?? colors.textSecondary;
    return (
      <View style={[styles.badge, { backgroundColor: bg, borderColor: text }, style]}>
        <Text style={[styles.label, { color: text }]}>{label ?? 'Status'}</Text>
      </View>
    );
  }

  const config = verificationConfig[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.textColor },
        style,
      ]}
    >
      {config.dot && <View style={[styles.dot, { backgroundColor: config.dot }]} />}
      <Text style={[styles.label, { color: config.textColor }]}>
        {label ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
