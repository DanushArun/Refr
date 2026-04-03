import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { colors } from '../theme/colors';

const Auth = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator — linear onboarding flow.
 *
 * Splash → RoleSelection → ProfileSetup
 *
 * No back gesture on Splash; swipe-back enabled from RoleSelection onward.
 */
export function AuthNavigator() {
  return (
    <Auth.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Auth.Screen
        name="Splash"
        component={SplashScreen}
        options={{ gestureEnabled: false }}
      />
      <Auth.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Auth.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Auth.Navigator>
  );
}
