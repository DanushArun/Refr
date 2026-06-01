import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

export const TAB_SCENE_STYLE = { backgroundColor: 'transparent' } as const;

export const TAB_BAR_STYLE = {
  backgroundColor: colors.backgroundElevated,
  borderTopColor: colors.border,
  height: 84,
  paddingBottom: 28,
  paddingTop: 8,
} as const;

export const BASE_TAB_SCREEN_OPTIONS: BottomTabNavigationOptions = {
  animation: 'none',
  headerShown: false,
  lazy: false,
  sceneStyle: TAB_SCENE_STYLE,
  tabBarActiveTintColor: colors.gold,
  tabBarHideOnKeyboard: true,
  tabBarInactiveTintColor: colors.textTertiary,
  tabBarStyle: TAB_BAR_STYLE,
};
