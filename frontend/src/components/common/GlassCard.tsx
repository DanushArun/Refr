import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Padding variant — default uses layout.cardPadding */
  padding?: 'none' | 'small' | 'default' | 'large';
  /** Border accent color — undefined means standard glass border */
  accentBorder?: string;
  /** Removes border radius for full-width cards */
  square?: boolean;
}

const paddingMap = {
  none: 0,
  small: 12,
  default: layout.cardPadding,
  large: 24,
} as const;

/**
 * GlassCard — the foundational surface component for the REFR dark glass aesthetic.
 *
 * Uses a dark semi-transparent background with a hairline white border to simulate
 * glass-morphism on dark backgrounds. All feed cards and stat widgets use this as
 * their outer container.
 *
 * On React Native there is no true backdrop-filter — the glass effect is achieved
 * with layered opacity and a slightly lighter background than the base canvas.
 */
export function GlassCard({
  children,
  style,
  padding = 'default',
  accentBorder,
  square = false,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        !square && styles.rounded,
        { padding: paddingMap[padding] },
        accentBorder ? { borderColor: accentBorder, borderWidth: 1 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rounded: {
    borderRadius: layout.cardBorderRadius,
  },
});
