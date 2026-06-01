import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';
import { hasPickedRole } from '../src/services/demoRoleStorage';
import { DEMO } from '../src/config/demo';
import { colors } from '../src/theme/colors';

export default function Index(): React.ReactElement {
  const { session, user, loading } = useAuth();
  const pickedDemoRole = hasPickedRole();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Demo mode: show branded welcome until the reviewer taps Get started
  if (DEMO.enabled && !pickedDemoRole) {
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

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
  },
});
