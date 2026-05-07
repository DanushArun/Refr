import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { hapticSelection } from '../../src/utils/haptics';

export default function ReferrerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopWidth: 0,
        elevation: 0,
        height: 84,
        paddingBottom: 28,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontFamily: 'Outfit-Medium',
        fontSize: 11,
        letterSpacing: 0.3,
      },
    }}>
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{ tabPress: () => hapticSelection() }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: 'Active',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{ tabPress: () => hapticSelection() }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{ tabPress: () => hapticSelection() }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{ tabPress: () => hapticSelection() }}
      />
    </Tabs>
  );
}
