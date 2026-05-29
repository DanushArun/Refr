import { Tabs } from 'expo-router';
import { LiquidGlassTabBar } from '../../src/components/navigation/LiquidGlassTabBar';
import {
  SMOOTH_TAB_SCREEN_OPTIONS,
  TAB_DETACH_INACTIVE_SCREENS,
} from '../../src/components/navigation/tabTransition';

export default function SeekerTabsLayout() {
  return (
    <Tabs
      initialRouteName="discover"
      detachInactiveScreens={TAB_DETACH_INACTIVE_SCREENS}
      screenOptions={SMOOTH_TAB_SCREEN_OPTIONS}
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="pipeline" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
