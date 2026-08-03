import type { ReactElement, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { decideSwipe, type SwipeAction } from './swipeDecision';

interface SwipeDeckProps {
  children: ReactNode;
  onAction: (action: Exclude<SwipeAction, 'reset'>) => void;
}

function exitPosition(action: Exclude<SwipeAction, 'reset'>, width: number, height: number): {
  x: number;
  y: number;
} {
  'worklet';
  if (action === 'save') return { x: 0, y: -height };
  return { x: action === 'request' ? width : -width, y: 0 };
}

export function SwipeDeck({ children, onAction }: SwipeDeckProps): ReactElement {
  const { height, width } = useWindowDimensions();
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(8)
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      const action = decideSwipe({
        translationX: event.translationX,
        translationY: event.translationY,
        velocityX: event.velocityX,
        velocityY: event.velocityY,
      });
      if (action === 'reset') {
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
        return;
      }

      const destination = exitPosition(action, width, height);
      translationX.value = withTiming(destination.x, { duration: 180 });
      translationY.value = withTiming(destination.y, { duration: 180 }, (finished) => {
        if (finished) runOnJS(onAction)(action);
      });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { rotate: `${translationX.value / 24}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View accessibilityHint="Swipe left to pass, right to continue, or up to save." style={cardStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
