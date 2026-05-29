import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';
import { hasPickedRole } from '../src/services/demoRoleStorage';
import { DEMO } from '../src/config/demo';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { session, user, loading } = useAuth();
  console.log('[route-debug] Index render', { loading, role: user?.role, hasSession: !!session });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Demo mode: show branded welcome until the reviewer taps Get started
  if (DEMO.enabled && !hasPickedRole()) {
    return <WelcomeScreen />;
  }

  if (!session || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'seeker') {
    return <Redirect href="/(seeker-tabs)/discover" />;
  }
  return <Redirect href="/(referrer-tabs)/discover" />;
}
