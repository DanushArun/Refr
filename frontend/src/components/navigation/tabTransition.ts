import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export const TAB_DETACH_INACTIVE_SCREENS = false;

export const SMOOTH_TAB_SCREEN_OPTIONS: BottomTabNavigationOptions = {
  headerShown: false,
  sceneStyle: { backgroundColor: 'transparent' },
  lazy: false,
  animation: 'none',
  tabBarHideOnKeyboard: true,
};
