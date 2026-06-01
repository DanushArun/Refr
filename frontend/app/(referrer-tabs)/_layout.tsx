import type { ComponentProps, ReactElement } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_TAB_SCREEN_OPTIONS } from '../../src/components/navigation/tabBarOptions';
import { FloatingLiquidTabBar } from '../../src/components/navigation/FloatingLiquidTabBar';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { focused: IconName; unfocused: IconName }> = {
  discover: { focused: 'compass', unfocused: 'compass-outline' },
  inbox: { focused: 'mail', unfocused: 'mail-outline' },
  active: { focused: 'people', unfocused: 'people-outline' },
  earnings: { focused: 'trophy', unfocused: 'trophy-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

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
export default function ReferrerTabsLayout(): ReactElement {
  return (
    <Tabs
      initialRouteName="discover"
      screenOptions={({ route }) => ({
        ...BASE_TAB_SCREEN_OPTIONS,
        tabBarIcon: ({ color, focused }) => {
          const icon = ICONS[route.name] ?? ICONS.discover;
          return (
            <Ionicons
              name={focused ? icon.focused : icon.unfocused}
              size={23}
              color={color}
            />
          );
        },
      })}
      tabBar={(props) => <FloatingLiquidTabBar {...props} />}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="active" options={{ title: 'Active' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
