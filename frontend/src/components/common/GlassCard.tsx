import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Canvas, BackdropFilter, Blur, Fill } from '@shopify/react-native-skia';
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
 * Uses a Skia BackdropFilter for a true glass-morphism effect on dark backgrounds.
 * All feed cards and stat widgets use this as their outer container.
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
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Canvas style={StyleSheet.absoluteFill}>
          <BackdropFilter filter={<Blur blur={15} />}>
            <Fill color={colors.surface} />
          </BackdropFilter>
        </Canvas>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  rounded: {
    borderRadius: layout.cardBorderRadius,
  },
});
