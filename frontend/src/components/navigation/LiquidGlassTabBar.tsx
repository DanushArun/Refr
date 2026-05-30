import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../common/PressableScale';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { Phrase } from '../../utils/haptics';
import {
  clampSlotIndex,
  indicatorXForIndex,
  shouldDispatchNavigation,
  slotIndexForFingerX,
} from './tabBarLogic';

const TAB_ICONS = {
  discover: { active: 'compass', inactive: 'compass-outline' },
  matches: { active: 'heart', inactive: 'heart-outline' },
  pipeline: { active: 'pulse', inactive: 'pulse-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  inbox: { active: 'mail', inactive: 'mail-outline' },
  active: { active: 'people', inactive: 'people-outline' },
  earnings: { active: 'trophy', inactive: 'trophy-outline' },
} as const;

type IconName = keyof typeof TAB_ICONS;

const HORIZONTAL_INSET = 20;
const HEIGHT = 70;
const INNER_PADDING = 8;
const PILL_VERTICAL_INSET = 6;
const LONG_PRESS_MS = 220;
const SPRING_CONFIG = { stiffness: 220, damping: 22, mass: 0.9 } as const;

const SUPPORTS_LIQUID = Platform.OS === 'ios' && isLiquidGlassAvailable();

function pickIcon(routeName: string): IconName | null {
  const key = routeName as IconName;
  if (!(key in TAB_ICONS)) return null;
  return key;
}

export function LiquidGlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const BOTTOM_INSET = insets.bottom > 0 ? insets.bottom - 14 : 16;
  const { width: screenWidth } = useWindowDimensions();
  const tabCount = state.routes.length;
  const containerWidth = screenWidth - HORIZONTAL_INSET * 2;
  const trackWidth = containerWidth - INNER_PADDING * 2;
  const tabWidth = tabCount > 0 ? trackWidth / tabCount : 0;

  const indicatorX = useSharedValue(indicatorXForIndex(state.index, tabWidth));
  const pillScale = useSharedValue(1);
  const pillLift = useSharedValue(0);
  const [draggingJS, setDraggingJS] = useState(false);

  useEffect(() => {
    if (draggingJS) return;
    indicatorX.value = withSpring(indicatorXForIndex(state.index, tabWidth), SPRING_CONFIG);
  }, [state.index, tabWidth, draggingJS, indicatorX]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      state.routes.forEach((route, index) => {
        if (index !== state.index) navigation.preload(route.name, route.params);
      });
    });
    return () => task.cancel();
  }, [navigation, state.index, state.routes]);

  const navigateToIndex = useCallback(
    (index: number) => {
      const safe = clampSlotIndex(index, tabCount);
      const route = state.routes[safe];
      if (!route) return;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      const dispatch = shouldDispatchNavigation({
        currentIndex: state.index,
        targetIndex: safe,
        defaultPrevented: event.defaultPrevented,
        tabCount,
      });
      if (dispatch) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, state.index, state.routes, tabCount],
  );

  const onTabPress = useCallback(
    (index: number) => {
      Phrase.tick();
      navigateToIndex(index);
    },
    [navigateToIndex],
  );

  const onCrossSlot = useCallback(() => {
    Phrase.tick();
  }, []);

  const onDragStart = useCallback(() => {
    setDraggingJS(true);
    Phrase.tap();
  }, []);

  const onDragEnd = useCallback(
    (index: number) => {
      setDraggingJS(false);
      navigateToIndex(index);
    },
    [navigateToIndex],
  );

  const panGesture = useMemo(() => {
    const lastSlot = { value: state.index };
    return Gesture.Pan()
      .activateAfterLongPress(LONG_PRESS_MS)
      .minDistance(0)
      .onStart((e) => {
        runOnJS(onDragStart)();
        pillScale.value = withTiming(1.06, { duration: 140 });
        pillLift.value = withTiming(-2, { duration: 140 });
        const slot = slotIndexForFingerX({
          fingerX: e.x,
          tabWidth,
          tabCount,
          innerPadding: INNER_PADDING,
        });
        lastSlot.value = slot;
        indicatorX.value = withSpring(indicatorXForIndex(slot, tabWidth), SPRING_CONFIG);
      })
      .onUpdate((e) => {
        const slot = slotIndexForFingerX({
          fingerX: e.x,
          tabWidth,
          tabCount,
          innerPadding: INNER_PADDING,
        });
        if (slot !== lastSlot.value) {
          lastSlot.value = slot;
          runOnJS(onCrossSlot)();
          indicatorX.value = withSpring(indicatorXForIndex(slot, tabWidth), SPRING_CONFIG);
        }
      })
      .onEnd(() => {
        pillScale.value = withSpring(1, SPRING_CONFIG);
        pillLift.value = withSpring(0, SPRING_CONFIG);
        runOnJS(onDragEnd)(lastSlot.value);
      });
  }, [
    indicatorX,
    onCrossSlot,
    onDragEnd,
    onDragStart,
    pillLift,
    pillScale,
    state.index,
    tabCount,
    tabWidth,
  ]);

  const pillStyle = useAnimatedStyle(() => ({
    width: tabWidth,
    transform: [
      { translateX: indicatorX.value },
      { translateY: pillLift.value },
      { scale: pillScale.value },
    ],
  }));

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: BOTTOM_INSET }]}>
      <View
        pointerEvents="box-none"
        style={[
          styles.container,
          { width: containerWidth, marginHorizontal: HORIZONTAL_INSET },
        ]}
      >
        <CapsuleSurface>
          <View style={styles.rim} />
          <Animated.View style={[styles.pillWrapper, pillStyle]}>
            <PillSurface />
          </Animated.View>
          <GestureDetector gesture={panGesture}>
            <View style={[styles.row, { paddingHorizontal: INNER_PADDING }]}>
              {state.routes.map((route, index) => {
                const focused = state.index === index;
                const iconKey = pickIcon(route.name);
                const label = descriptors[route.key]?.options.title ?? route.name;
                const iconName = iconKey
                  ? focused
                    ? TAB_ICONS[iconKey].active
                    : TAB_ICONS[iconKey].inactive
                  : 'ellipse-outline';
                return (
                  <PressableScale
                    key={route.key}
                    style={[styles.tab, { width: tabWidth }]}
                    onPress={() => onTabPress(index)}
                    accessibilityRole="button"
                    accessibilityState={focused ? { selected: true } : {}}
                    accessibilityLabel={label}
                  >
                    <Ionicons
                      name={iconName}
                      size={22}
                      color={focused ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? colors.accent : colors.textTertiary },
                      ]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </GestureDetector>
        </CapsuleSurface>
      </View>
    </View>
  );
}

function CapsuleSurface({ children }: { children: React.ReactNode }) {
  if (SUPPORTS_LIQUID) {
    return (
      <GlassContainer spacing={24} style={styles.capsule}>
        <GlassView
          glassEffectStyle="regular"
          tintColor={colors.navyDeep}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </GlassContainer>
    );
  }
  return (
    <BlurView
      intensity={92}
      tint="dark"
      experimentalBlurMethod="dimezisBlurView"
      style={[styles.capsule, styles.capsuleFallback]}
    >
      {children}
    </BlurView>
  );
}

function PillSurface() {
  if (SUPPORTS_LIQUID) {
    return (
      <GlassView
        glassEffectStyle="clear"
        isInteractive
        style={[styles.pill, styles.pillGlassEdge]}
      />
    );
  }
  return <View style={[styles.pill, styles.pillFallback]} />;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  container: {
    height: HEIGHT,
  },
  capsule: {
    flex: 1,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(6, 22, 56, 0.55)',
  },
  capsuleFallback: {
    backgroundColor: 'rgba(6, 22, 56, 0.78)',
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.18)',
    borderTopColor: 'rgba(232, 189, 88, 0.45)',
  },
  pillWrapper: {
    position: 'absolute',
    top: PILL_VERTICAL_INSET,
    bottom: PILL_VERTICAL_INSET,
    left: INNER_PADDING,
  },
  pill: {
    flex: 1,
    borderRadius: (HEIGHT - PILL_VERTICAL_INSET * 2) / 2,
    overflow: 'hidden',
  },
  pillGlassEdge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  pillFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
