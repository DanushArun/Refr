import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

export const TAB_SCENE_STYLE = { backgroundColor: 'transparent' } as const;

export const LIQUID_TAB_BAR_HEIGHT = 75;
export const LIQUID_TAB_BAR_RADIUS = LIQUID_TAB_BAR_HEIGHT / 2;

export const TAB_BAR_STYLE = {
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  elevation: 0,
  position: 'absolute',
} as const;

export const BASE_TAB_SCREEN_OPTIONS: BottomTabNavigationOptions = {
  animation: 'none',
  headerShown: false,
  lazy: false,
  sceneStyle: TAB_SCENE_STYLE,
  tabBarActiveTintColor: colors.gold,
  tabBarAllowFontScaling: false,
  tabBarHideOnKeyboard: true,
  tabBarInactiveTintColor: colors.textTertiary,
  tabBarLabelPosition: 'below-icon',
  tabBarShowLabel: true,
  tabBarStyle: TAB_BAR_STYLE,
};
