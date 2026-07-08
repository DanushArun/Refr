import type { ComponentProps, ReactElement } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { BASE_TAB_SCREEN_OPTIONS } from './tabBarOptions';
import { FloatingLiquidTabBar } from './FloatingLiquidTabBar';
import { ALL_ROLE_TABS, tabIsVisibleForRole } from './roleTabs';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { focused: IconName; unfocused: IconName }> = {
  active: { focused: 'people', unfocused: 'people-outline' },
  discover: { focused: 'compass', unfocused: 'compass-outline' },
  earnings: { focused: 'trophy', unfocused: 'trophy-outline' },
  inbox: { focused: 'mail', unfocused: 'mail-outline' },
  matches: { focused: 'heart', unfocused: 'heart-outline' },
  pipeline: { focused: 'git-branch', unfocused: 'git-branch-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

export function RoleTabsLayout(): ReactElement {
  const { user } = useAuth();

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
      {ALL_ROLE_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            href: tabIsVisibleForRole(tab.name, user?.role) ? undefined : null,
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}
