import React, { useState, useRef, memo } from 'react';
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
import { spacing, layout } from '../../theme/spacing';
import { lightJourney } from '../../theme/lightJourney';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  name?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Show a clear button when input has value */
  clearable?: boolean;
  onChangeValue?: (name: string, value: string) => void;
}

/**
 * Input — light themed text input with an animated floating label.
 *
 * The label lifts to a small caption above the field when focused or filled.
 * Error state renders a red border and error message below.
 */
export const Input = memo(function Input({
  label,
  name,
  error,
  hint,
  containerStyle,
  clearable = false,
  value,
  onChangeText,
  onChangeValue,
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

  function handleChange(text: string) {
    if (onChangeText) onChangeText(text);
    if (onChangeValue && name) onChangeValue(name, text);
  }

  const labelTranslateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.733], // 11 / 15 = 0.733
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      lightJourney.textMuted,
      isFocused ? lightJourney.blue : lightJourney.textMuted,
    ],
  });

  const labelBgColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', lightJourney.background],
  });

  const borderColor = error
    ? lightJourney.error
    : isFocused
    ? lightJourney.blue
    : lightJourney.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.field, { borderColor }]}>
        <Animated.Text
          style={[
            styles.floatingLabel,
            { 
              transform: [
                { translateY: labelTranslateY },
                { scale: labelScale },
                { translateX: labelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3] // Adjust horizontal position slightly due to scale anchor
                })}
              ],
              color: labelColor,
              backgroundColor: labelBgColor,
            },
          ]}
          numberOfLines={1}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>

        <TextInput
          {...rest}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, isActive && styles.inputActive]}
          placeholderTextColor="transparent"
          selectionColor={lightJourney.blue}
          cursorColor={lightJourney.blue}
        />

        {clearable && hasValue && (
          <TouchableOpacity
            onPress={() => handleChange('')}
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
});

const styles = StyleSheet.create({
  container: {
  },
  field: {
    height: layout.inputHeight,
    backgroundColor: lightJourney.surface,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: spacing[4],
    fontFamily: 'TikTokSans-Regular',
    zIndex: 1,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  input: {
    fontFamily: 'TikTokSans-Regular',
    fontSize: 15,
    color: lightJourney.text,
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
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    lineHeight: 24,
  },
  errorText: {
    fontFamily: 'TikTokSans-Regular',
    fontSize: 12,
    color: lightJourney.error,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
  hintText: {
    fontFamily: 'TikTokSans-Regular',
    fontSize: 12,
    color: lightJourney.textMuted,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
});
