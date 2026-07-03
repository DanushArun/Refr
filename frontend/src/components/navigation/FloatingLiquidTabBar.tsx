import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { BlurView, type BlurTint } from 'expo-blur';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { hapticSelection } from '../../utils/haptics';
import { activePillMetrics } from './FloatingLiquidTabBar.geometry';
import { floatingLiquidTabBarStyles as styles } from './FloatingLiquidTabBar.styles';

type TabRoute = BottomTabBarProps['state']['routes'][number];

interface TabItemProps {
  focused: boolean;
  index: number;
  props: BottomTabBarProps;
  route: TabRoute;
}

const tabBarBlurTint: BlurTint =
  Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'dark';

function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}

function shouldHideBar(props: BottomTabBarProps, keyboardVisible: boolean): boolean {
  const route = props.state.routes[props.state.index];
  const options = props.descriptors[route.key].options;

  return keyboardVisible && options.tabBarHideOnKeyboard === true;
}

function labelFor(options: BottomTabNavigationOptions, routeName: string): string {
  if (typeof options.tabBarLabel === 'string') return options.tabBarLabel;
  if (typeof options.title === 'string') return options.title;

  return routeName.charAt(0).toUpperCase() + routeName.slice(1);
}

function barOffset(bottomInset: number): ViewStyle {
  const minimumClearance = Platform.OS === 'ios' ? spacing[2] : spacing[3];
  const loweredInset = Math.max(0, bottomInset - spacing[2]);

  return { marginBottom: Math.max(loweredInset, minimumClearance) };
}

function activePillStyle(index: number, routeCount: number, rowWidth: number): StyleProp<ViewStyle> {
  const metrics = activePillMetrics(index, routeCount, rowWidth);
  if (!metrics) return null;

  return [styles.activePill, metrics];
}

function pressTab(props: BottomTabBarProps, route: TabRoute, focused: boolean): void {
  const event = props.navigation.emit({
    type: 'tabPress',
    target: route.key,
    canPreventDefault: true,
  });

  if (event.defaultPrevented) return;

  void hapticSelection();
  if (focused) return;

  props.navigation.dispatch({
    ...CommonActions.navigate({ name: route.name, params: route.params }),
    target: props.state.key,
  });
}

function longPressTab(props: BottomTabBarProps, route: TabRoute): void {
  props.navigation.emit({
    type: 'tabLongPress',
    target: route.key,
  });
}

function renderIcon(
  options: BottomTabNavigationOptions,
  focused: boolean,
  color: string,
): ReactNode {
  return options.tabBarIcon?.({ focused, color, size: 23 }) ?? null;
}

function renderBadge(badge: BottomTabNavigationOptions['tabBarBadge']): ReactNode {
  if (badge === undefined || badge === null) return null;

  return (
    <View style={styles.badge}>
      <Text allowFontScaling={false} numberOfLines={1} style={styles.badgeText}>
        {badge}
      </Text>
    </View>
  );
}

function itemStyle(pressed: boolean, focused: boolean): StyleProp<ViewStyle> {
  return [
    styles.item,
    focused && styles.itemFocused,
    pressed && styles.itemPressed,
  ];
}

function BarSurface(): ReactElement {
  return (
    <View pointerEvents="none" style={styles.surfaceStack}>
      <BlurView
        blurReductionFactor={Platform.OS === 'android' ? 2 : undefined}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        intensity={Platform.OS === 'android' ? 72 : 58}
        tint={tabBarBlurTint}
        style={styles.glassBlur}
      />
    </View>
  );
}

function TabItem({ focused, index, props, route }: TabItemProps): ReactElement {
  const descriptor = props.descriptors[route.key];
  const color = focused ? colors.goldBright : colors.textSecondary;
  const label = labelFor(descriptor.options, route.name);

  return (
    <Pressable
      accessibilityLabel={`${label}, tab, ${index + 1} of ${props.state.routes.length}`}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onLongPress={() => longPressTab(props, route)}
      onPress={() => pressTab(props, route, focused)}
      style={({ pressed }) => itemStyle(pressed, focused)}
      testID={descriptor.options.tabBarButtonTestID}
    >
      <View style={styles.iconSlot}>
        {renderIcon(descriptor.options, focused, color)}
        {renderBadge(descriptor.options.tabBarBadge)}
      </View>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.label, { color }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function FloatingLiquidTabBar(props: BottomTabBarProps): ReactElement | null {
  const keyboardVisible = useKeyboardVisible();
  const [rowWidth, setRowWidth] = useState(0);

  if (shouldHideBar(props, keyboardVisible)) return null;

  function handleRowLayout(event: LayoutChangeEvent): void {
    setRowWidth(event.nativeEvent.layout.width);
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.bar, barOffset(props.insets.bottom)]}>
        <BarSurface />
        <View onLayout={handleRowLayout} role="tablist" style={styles.row}>
          <View
            pointerEvents="none"
            style={activePillStyle(props.state.index, props.state.routes.length, rowWidth)}
          />
          {props.state.routes.map((route, index) => (
            <TabItem
              focused={props.state.index === index}
              index={index}
              key={route.key}
              props={props}
              route={route}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
