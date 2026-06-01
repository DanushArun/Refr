import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { hapticSelection } from '../../utils/haptics';
import {
  LIQUID_TAB_BAR_HEIGHT,
  LIQUID_TAB_BAR_RADIUS,
} from './tabBarOptions';

type TabRoute = BottomTabBarProps['state']['routes'][number];

interface TabItemProps {
  focused: boolean;
  index: number;
  props: BottomTabBarProps;
  route: TabRoute;
}

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
  const fallback = Platform.OS === 'ios' ? spacing[3] : spacing[4];

  return { marginBottom: Math.max(bottomInset, fallback) };
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
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.innerShade} />
    </View>
  );
}

function TabItem({ focused, index, props, route }: TabItemProps): ReactElement {
  const descriptor = props.descriptors[route.key];
  const color = focused ? colors.goldBright : colors.textTertiary;
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

  if (shouldHideBar(props, keyboardVisible)) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.bar, barOffset(props.insets.bottom)]}>
        <BarSurface />
        <View role="tablist" style={styles.row}>
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  bar: {
    alignSelf: 'stretch',
    height: LIQUID_TAB_BAR_HEIGHT,
    marginHorizontal: layout.screenPaddingH,
    overflow: 'hidden',
    borderRadius: LIQUID_TAB_BAR_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0)',
    backgroundColor: 'rgba(5, 16, 46, 0.92)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.38,
    shadowRadius: 28,
    elevation: 20,
  },
  innerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(102, 74, 15, 0.35)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: LIQUID_TAB_BAR_HEIGHT - spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    overflow: 'hidden',
    borderRadius: LIQUID_TAB_BAR_RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemFocused: {
    borderColor: 'rgba(255, 255, 255, 0)',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  itemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconSlot: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    maxWidth: '100%',
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -13,
    minWidth: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: 9.5,
    backgroundColor: '#FF3B1F',
  },
  badgeText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    lineHeight: 13,
    color: '#FFFFFF',
    letterSpacing: 0,
  },
});
