import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { DotMatrixField } from './DotMatrixField';

interface DotMatrixBackgroundProps {
  cellSize?: number;
  tone?: 'dark' | 'paper';
}

export function DotMatrixBackground({
  cellSize = 20,
  tone = 'dark',
}: DotMatrixBackgroundProps): React.ReactElement {
  const opacity = useSharedValue(0.5);
  const [containerHeight, setContainerHeight] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  useEffect(() => {
    // Gentle overall breathing effect for the entire matrix
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} onLayout={onLayout} pointerEvents="none">
      {containerHeight > 0 && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            animatedStyle,
          ]}
        >
          <DotMatrixField
            variant="pulse"
            active={true}
            tone={tone}
            cellSize={cellSize}
            dotRadius={1.5}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
    </View>
  );
}
