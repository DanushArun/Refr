import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;

interface StampProps {
  translateX: SharedValue<number>;
  kind: 'request' | 'pass';
}

/**
 * Stamp overlay on the active card. Opacity maps to drag distance:
 *   REQUEST: 0 → 1 as translateX goes 0 → threshold
 *   PASS:    1 → 0 as translateX goes -threshold → 0
 */
export function SwipeStamp({ translateX, kind }: StampProps) {
  const isRequest = kind === 'request';
  const color = isRequest ? colors.success : colors.error;
  const label = isRequest ? 'REQUEST' : 'PASS';
  const rotate = isRequest ? '-18deg' : '18deg';

  const animStyle = useAnimatedStyle(() => {
    const opacity = isRequest
      ? interpolate(translateX.value, [0, COMMIT_THRESHOLD], [0, 1], Extrapolation.CLAMP)
      : interpolate(translateX.value, [-COMMIT_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        isRequest ? styles.right : styles.left,
        { transform: [{ rotate }] },
        animStyle,
      ]}
    >
      <View style={[styles.box, { borderColor: color }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 28, zIndex: 10 },
  right: { left: 24 },
  left: { right: 24 },
  box: {
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  text: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    letterSpacing: 3,
  },
});
