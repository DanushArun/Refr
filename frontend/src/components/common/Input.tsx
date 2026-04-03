import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Show a clear button when input has value */
  clearable?: boolean;
}

/**
 * Input — dark themed text input with animated floating label.
 *
 * The label lifts to a small caption above the field when focused or filled.
 * Error state renders a red border and error message below.
 */
export function Input({
  label,
  error,
  hint,
  containerStyle,
  clearable = false,
  value,
  onChangeText,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const hasValue = !!value;
  const isActive = isFocused || hasValue;

  function animateLabel(toValue: number) {
    Animated.timing(labelAnim, {
      toValue,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  function handleFocus() {
    setIsFocused(true);
    animateLabel(1);
    rest.onFocus?.(null as any);
  }

  function handleBlur() {
    setIsFocused(false);
    if (!hasValue) animateLabel(0);
    rest.onBlur?.(null as any);
  }

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textTertiary, isFocused ? colors.accent : colors.textSecondary],
  });

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.accent
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.field, { borderColor }]}>
        {/* Floating label */}
        <Animated.Text
          style={[
            styles.floatingLabel,
            { top: labelTop, fontSize: labelFontSize, color: labelColor },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, isActive && styles.inputActive]}
          placeholderTextColor="transparent"
          selectionColor={colors.accent}
          cursorColor={colors.accent}
        />

        {clearable && hasValue && (
          <TouchableOpacity
            onPress={() => onChangeText?.('')}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearIcon}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  field: {
    height: layout.inputHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: spacing[4],
    fontFamily: 'Outfit-Regular',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  input: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: colors.text,
    paddingTop: 10,
    paddingBottom: 2,
  },
  inputActive: {
    paddingTop: 14,
  },
  clearButton: {
    position: 'absolute',
    right: spacing[4],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 20,
    color: colors.textTertiary,
    fontFamily: 'Outfit-Regular',
    lineHeight: 24,
  },
  errorText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.error,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
  hintText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
});
