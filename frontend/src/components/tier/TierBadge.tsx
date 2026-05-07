import React from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tierForScore, type Tier } from './tiers';

interface TierBadgeProps {
  /** Pass either score or a resolved tier. Score takes precedence. */
  score?: number;
  tier?: Tier;
  size?: 'sm' | 'md' | 'lg';
  /** Show just the icon in a circle (for leaderboard rows, compact places). */
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tier badge. Icon + name pill by default.
 * Icons escalate in prestige:  medal-outline → medal → trophy → star → diamond.
 * Used on swipe cards, profile, leaderboard, earnings hero.
 */
export function TierBadge({
  score,
  tier,
  size = 'md',
  iconOnly = false,
  style,
}: TierBadgeProps) {
  const resolved = tier ?? tierForScore(score ?? 0);

  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;
  const fontSize = size === 'sm' ? 9 : size === 'lg' ? 12 : 10;
  const paddingH = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;
  const paddingV = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const tracking = size === 'sm' ? 0.5 : 0.8;

  if (iconOnly) {
    const dim = size === 'sm' ? 22 : size === 'lg' ? 34 : 28;
    return (
      <View
        style={[
          styles.iconCircle,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: resolved.light,
            borderColor: resolved.color,
          },
          style,
        ]}
      >
        <Ionicons name={resolved.icon} size={iconSize + 3} color={resolved.color} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: resolved.light,
          borderColor: resolved.color,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
        style,
      ]}
    >
      <Ionicons name={resolved.icon} size={iconSize} color={resolved.color} />
      <Text
        style={[
          styles.label,
          {
            color: resolved.color,
            fontSize,
            letterSpacing: tracking,
          },
        ]}
      >
        {resolved.name.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontFamily: 'Outfit-Bold',
  },
});
