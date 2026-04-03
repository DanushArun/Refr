import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'fade_from_bottom',
      contentStyle: { backgroundColor: colors.background }
    }} />
  );
}
