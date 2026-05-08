import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Phrase } from '../../utils/haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

const TAB_BAR_HEIGHT = 70;
const HORIZONTAL_INSET = 20;
const BOTTOM_INSET = 26;
const INNER_PADDING = 6;

type IconName = keyof typeof Ionicons.glyphMap;

interface TabIcon {
  active: IconName;
  inactive: IconName;
}

const TAB_ICONS: Record<string, TabIcon> = {
  discover: { active: 'compass', inactive: 'compass-outline' },
  matches: { active: 'heart', inactive: 'heart-outline' },
  pipeline: { active: 'pulse', inactive: 'pulse-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  inbox: { active: 'mail', inactive: 'mail-outline' },
  active: { active: 'people', inactive: 'people-outline' },
  earnings: { active: 'trophy', inactive: 'trophy-outline' },
};

const DEFAULT_ICON: TabIcon = { active: 'ellipse', inactive: 'ellipse-outline' };

/**
 * Floating liquid-glass tab bar.
 *
 *  - Vertical icon-over-label layout per tab
 *  - The indicator pill covers the full slot (icon AND label) so labels never
 *    get clipped or overflow the highlight
 *  - Spring-animated indicator slides between tabs
 */
export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [innerWidth, setInnerWidth] = useState(0);
  const tabCount = state.routes.length;
  const tabWidth = innerWidth > 0 ? (innerWidth - INNER_PADDING * 2) / tabCount : 0;

  const indicatorX = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth, {
      stiffness: 220,
      damping: 22,
      mass: 0.9,
    });
  }, [state.index, tabWidth, indicatorX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setInnerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.capsule} onLayout={onLayout}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.glassTint} />
        <View style={styles.rimLight} pointerEvents="none" />

        <ActiveIndicator x={indicatorX} width={tabWidth} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const onPress = () => {
              Phrase.tick();
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                (navigation.navigate as (name: string) => void)(route.name);
              }
            };

            const icons = TAB_ICONS[route.name] ?? DEFAULT_ICON;
            const label = typeof options.title === 'string' ? options.title : route.name;

            return (
              <TabButton
                key={route.key}
                onPress={onPress}
                icon={focused ? icons.active : icons.inactive}
                label={label}
                focused={focused}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ActiveIndicator({ x, width }: { x: SharedValue<number>; width: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  if (width <= 0) return null;

  return (
    <Animated.View
      style={[styles.indicatorTrack, { width, left: INNER_PADDING }, animatedStyle]}
      pointerEvents="none"
    >
      <View style={styles.indicatorPill}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.indicatorTint} />
        <View style={styles.indicatorRim} pointerEvents="none" />
      </View>
    </Animated.View>
  );
}

interface TabButtonProps {
  icon: IconName;
  label: string;
  focused: boolean;
  onPress: () => void;
}

function TabButton({ icon, label, focused, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : undefined}
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={22}
        color={focused ? colors.accent : colors.textSecondary}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: focused ? colors.accent : colors.textTertiary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: HORIZONTAL_INSET,
    right: HORIZONTAL_INSET,
    bottom: BOTTOM_INSET,
    alignItems: 'center',
  },
  capsule: {
    width: SCREEN_WIDTH - HORIZONTAL_INSET * 2,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 31, 68, 0.55)',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 24,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  rimLight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.15)',
    borderTopColor: 'rgba(212, 167, 68, 0.30)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: INNER_PADDING,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    letterSpacing: 0.4,
  },

  indicatorTrack: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  indicatorPill: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 167, 68, 0.14)',
  },
  indicatorTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 167, 68, 0.10)',
  },
  indicatorRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.45)',
    borderTopColor: 'rgba(232, 189, 88, 0.75)',
  },
});
