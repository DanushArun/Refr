import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { hapticSelection } from '../../src/utils/haptics';

export default function SeekerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
    }}>
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="pipeline" options={{ title: 'Pipeline' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} listeners={{ tabPress: () => hapticSelection() }} />
    </Tabs>
  );
}