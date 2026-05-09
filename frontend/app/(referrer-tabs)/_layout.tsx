import { Tabs } from 'expo-router';
import { LiquidGlassTabBar } from '../../src/components/navigation/LiquidGlassTabBar';

/**
 * Referrer tab layout — five tabs.
 *
 *   Discover — swipe deck of incoming candidate requests (was misleadingly
 *              labelled "Inbox" before).
 *   Inbox    — chat surface: tiered list of conversations with candidates
 *              the referrer has accepted. Mirror of the seeker's Matches.
 *   Active   — pipeline tracker with voyage cards + per-candidate actions.
 *   Earnings — payout history + reputation score.
 *   Profile  — settings + verification.
 */
export default function ReferrerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="active" options={{ title: 'Active' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
