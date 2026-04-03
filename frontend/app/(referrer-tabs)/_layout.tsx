import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { hapticSelection } from '../../src/utils/haptics';

export default function ReferrerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
    }}>
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="active" options={{ title: 'Active' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} listeners={{ tabPress: () => hapticSelection() }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} listeners={{ tabPress: () => hapticSelection() }} />
    </Tabs>
  );
}