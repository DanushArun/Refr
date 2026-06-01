import type { ComponentProps, ReactElement } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_TAB_SCREEN_OPTIONS } from '../../src/components/navigation/tabBarOptions';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { focused: IconName; unfocused: IconName }> = {
  discover: { focused: 'compass', unfocused: 'compass-outline' },
  matches: { focused: 'heart', unfocused: 'heart-outline' },
  pipeline: { focused: 'git-branch', unfocused: 'git-branch-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

export default function SeekerTabsLayout(): ReactElement {
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
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="pipeline" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
