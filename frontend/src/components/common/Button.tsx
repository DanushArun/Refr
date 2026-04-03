import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { hapticImpact } from '../../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const heightMap: Record<ButtonSize, number> = {
  small: layout.buttonHeightSmall,
  medium: layout.buttonHeight,
  large: 56,
};

const fontSizeMap: Record<ButtonSize, number> = {
  small: 13,
  medium: 15,
  large: 17,
};

/**
 * Button — three-variant button system.
 *
 * primary  — violet gradient, used exclusively for primary CTAs (e.g., "I can refer")
 * secondary — glass surface with border, used for secondary actions
 * text      — no background, used for tertiary / destructive-soft actions
 * danger    — red tinted glass, used for destructive confirmations
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const height = heightMap[size];
  const fontSize = fontSizeMap[size];

  const baseContainer: ViewStyle = {
    height,
    borderRadius: height / 2,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? 0.45 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    paddingHorizontal: size === 'small' ? 16 : 24,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[baseContainer, style]}
      >
        <LinearGradient
          colors={['#9333ea', '#7c3aed', '#6d28d9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Text style={[styles.label, { fontSize }, labelStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[baseContainer, styles.secondaryContainer, style]}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <Text style={[styles.label, styles.secondaryLabel, { fontSize }, labelStyle]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[baseContainer, styles.dangerContainer, style]}
      >
        {loading ? (
          <ActivityIndicator color={colors.error} size="small" />
        ) : (
          <Text style={[styles.label, styles.dangerLabel, { fontSize }, labelStyle]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // variant === 'text'
  return (
    <TouchableOpacity
      onPress={() => { hapticImpact(); onPress(); }}
      disabled={isDisabled}
      activeOpacity={0.6}
      style={[{ height, alignItems: 'center', justifyContent: 'center', opacity: isDisabled ? 0.45 : 1 }, style]}
    >
      <Text style={[styles.textLabel, { fontSize }, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Outfit-SemiBold',
    color: colors.text,
    letterSpacing: 0.2,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryLabel: {
    color: colors.text,
  },
  dangerContainer: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerLabel: {
    color: colors.error,
  },
  textLabel: {
    fontFamily: 'Outfit-Medium',
    color: colors.textSecondary,
  },
});
