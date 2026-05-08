import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../../src/theme/colors';
import { hapticSelection } from '../../src/utils/haptics';

export default function SeekerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarBackground: () => (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ),
      tabBarStyle: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(10, 10, 11, 0.4)',
        borderTopWidth: 1.5,
        borderTopColor: colors.glassHighlight,
        borderLeftWidth: 1,
        borderLeftColor: colors.borderStrong,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        elevation: 0,
        paddingBottom: 0,
        overflow: 'hidden',
      },
      tabBarItemStyle: {
        paddingVertical: 10,
      },
      tabBarLabelStyle: {
        fontFamily: 'Outfit-Medium',
        fontSize: 10,
        letterSpacing: 0.3,
        marginTop: 4,
        textTransform: 'uppercase',
      },
    }}>
      <Tabs.Screen
        name="discover"
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
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{ tabPress: () => hapticSelection() }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pulse' : 'pulse-outline'}
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
