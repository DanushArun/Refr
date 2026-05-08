import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../../src/theme/colors';
import { hapticSelection } from '../../src/utils/haptics';

export default function ReferrerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarBackground: () => (
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      ),
      tabBarStyle: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopWidth: 0,
        elevation: 0,
        paddingBottom: 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      tabBarItemStyle: {
        paddingVertical: 10,
      },
      tabBarLabelStyle: {
        fontFamily: 'Outfit-Medium',
        fontSize: 10,
        letterSpacing: 0.3,
        marginTop: 4,
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
