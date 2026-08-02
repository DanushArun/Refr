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
import { layout } from '../../theme/spacing';
import { hapticImpact, playSensoryEvent, type SensoryEvent } from '../../utils/haptics';
import { lightJourney } from '../../theme/lightJourney';

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
  sensoryEvent?: SensoryEvent;
  emphasis?: string;
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
 * Button — shared light journey action control.
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
  sensoryEvent,
  emphasis: _emphasis,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const height = heightMap[size];
  const fontSize = fontSizeMap[size];

  const handlePress = () => {
    if (sensoryEvent) void playSensoryEvent(sensoryEvent);
    onPress();
  };

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
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={handlePress}
        disabled={isDisabled}
        hitSlop={size === 'small' ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
        activeOpacity={0.8}
        style={[baseContainer, styles.primaryContainer, style]}
        >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.label, { fontSize }, labelStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={handlePress}
        disabled={isDisabled}
        hitSlop={size === 'small' ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
        activeOpacity={0.7}
        style={[baseContainer, styles.secondaryContainer, style]}
      >
        {loading ? (
          <ActivityIndicator color={lightJourney.blue} size="small" />
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
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={handlePress}
        disabled={isDisabled}
        hitSlop={size === 'small' ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
        activeOpacity={0.7}
        style={[baseContainer, styles.dangerContainer, style]}
      >
        {loading ? (
          <ActivityIndicator color={lightJourney.error} size="small" />
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
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={() => {
        if (sensoryEvent) {
          void playSensoryEvent(sensoryEvent);
        } else {
          void hapticImpact();
        }
        onPress();
      }}
      disabled={isDisabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.6}
      style={[styles.textContainer, { height, opacity: isDisabled ? 0.45 : 1 }, style]}
    >
      <Text style={[styles.textLabel, { fontSize }, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#FFFFFF',
    fontFamily: 'TikTokSans-Semibold',
    letterSpacing: 0,
  },
  primaryContainer: {
    backgroundColor: lightJourney.blue,
  },
  secondaryContainer: {
    backgroundColor: lightJourney.surface,
    borderWidth: 1,
    borderColor: lightJourney.border,
  },
  secondaryLabel: {
    color: lightJourney.ink,
  },
  dangerContainer: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: lightJourney.error,
  },
  dangerLabel: {
    color: lightJourney.error,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLabel: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Medium',
  },
});
