import { useEffect, type ComponentProps, type ReactElement } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { DEMO } from '../../demo/config';
import { lightJourney } from '../../theme/lightJourney';
import { ALL_ROLE_TABS, routeForRole, tabIsVisibleForRole } from './roleTabs';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { focused: IconName; unfocused: IconName }> = {
  active: { focused: 'people', unfocused: 'people-outline' },
  discover: { focused: 'compass', unfocused: 'compass-outline' },
  earnings: { focused: 'cash', unfocused: 'cash-outline' },
  inbox: { focused: 'mail', unfocused: 'mail-outline' },
  matches: { focused: 'mail', unfocused: 'mail-outline' },
  pipeline: { focused: 'pulse', unfocused: 'pulse-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

export function RoleTabsLayout(): ReactElement {
  const { user } = useAuth();
  const activeRole = DEMO.enabled ? DEMO.demoRole : user?.role;
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (activeRole === undefined) return;
    const routeShell = segments[0];
    const expectedShell = activeRole === 'referrer' ? 'referrer' : 'seeker';
    if (routeShell !== expectedShell) router.replace(routeForRole(activeRole));
  }, [activeRole, router, segments]);

  return (
    <Tabs
      initialRouteName="discover"
      screenOptions={({ route }) => ({
        animation: 'none',
        headerShown: false,
        lazy: true,
        sceneStyle: { backgroundColor: lightJourney.background },
        tabBarActiveTintColor: lightJourney.blue,
        tabBarAllowFontScaling: false,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: lightJourney.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontFamily: 'TikTokSans-Medium',
          fontSize: 11,
          marginBottom: 7,
        },
        tabBarStyle: {
          backgroundColor: lightJourney.surface,
          borderTopColor: lightJourney.border,
          borderTopWidth: 1,
          elevation: 0,
          height: 82,
          paddingTop: 6,
          shadowOpacity: 0,
        },
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
      {ALL_ROLE_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            href: tabIsVisibleForRole(tab.name, activeRole) ? undefined : null,
            title: tab.title,
          }}
        />
      ))}
    </Tabs>
  );
}
