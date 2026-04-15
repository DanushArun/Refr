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
  padding?: 'none' | 'small' | 'default' | 'large';
  accentBorder?: string;
  square?: boolean;
}

const paddingMap = {
  none: 0,
  small: 12,
  default: layout.cardPadding,
  large: 24,
} as const;

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
        square && { borderRadius: 0 },
        { padding: paddingMap[padding] },
        accentBorder
          ? { borderColor: accentBorder, borderWidth: 1 }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
  },
});
