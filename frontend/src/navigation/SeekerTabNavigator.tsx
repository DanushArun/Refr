import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import type { SeekerTabParamList } from '../types/navigation';
import { FeedScreen } from '../screens/FeedScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { PipelineScreen } from '../screens/PipelineScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { TabBarIcon } from './TabBarIcon';

const Tab = createBottomTabNavigator<SeekerTabParamList>();

/**
 * SeekerTabNavigator — bottom tab bar for job seekers.
 *
 * Tabs: Discover (feed) / Matches / Pipeline / Profile
 */
export function SeekerTabNavigator() {
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
        name="Discover"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="layers" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Pipeline"
        component={PipelineScreen}
        options={{
          tabBarLabel: 'Pipeline',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="git-branch" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SeekerProfile"
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
