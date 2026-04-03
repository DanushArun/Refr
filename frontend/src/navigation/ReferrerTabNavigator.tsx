import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import type { ReferrerTabParamList } from '../types/navigation';
import { InboxScreen } from '../screens/InboxScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { TabBarIcon } from './TabBarIcon';

const Tab = createBottomTabNavigator<ReferrerTabParamList>();

/**
 * ReferrerTabNavigator — bottom tab bar for referrers.
 *
 * Tabs: Inbox (referral requests) / Active (accepted referrals feed) / Earnings / Profile
 */
export function ReferrerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'Outfit-Medium',
          fontSize: 11,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="mail" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Active"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="layers" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="trending-up" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ReferrerProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: 64,
    paddingTop: spacing[2],
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
