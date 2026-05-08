import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface RollingNumberProps extends Omit<TextInputProps, 'value' | 'style'> {
  value: SharedValue<number>;
  style?: any;
}

export function RollingNumber({ value, style, ...rest }: RollingNumberProps) {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: Math.round(value.value).toString(),
      // On some platforms 'value' is needed instead of 'text' for AnimatedTextInput
      value: Math.round(value.value).toString(),
    } as any;
  });

  return (
    <AnimatedTextInput
      {...rest}
      underlineColorAndroid="transparent"
      editable={false}
      animatedProps={animatedProps}
      style={[styles.text, style]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
});
