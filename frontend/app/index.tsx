import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';
import { hasPickedRole } from '../src/services/demoRoleStorage';
import { DEMO } from '../src/demo/config';
import { lightJourney } from '../src/theme/lightJourney';

function targetRouteFor(role: string | undefined): string {
  return role === 'referrer'
    ? '/referrer/discover'
    : '/seeker/discover';
}

export default function Index(): React.ReactElement {
  const { session, user, loading } = useAuth();
  const pickedDemoRole = hasPickedRole();

  useEffect(() => {
    if (loading) return;
    if (DEMO.enabled && !pickedDemoRole) return;
    if (!session || !user) {
      router.replace('/(auth)/login');
      return;
    }
    router.replace(targetRouteFor(user.role));
  }, [loading, pickedDemoRole, session, user]);

  if (loading) return <LoadingScreen />;
  if (DEMO.enabled && !pickedDemoRole) return <WelcomeScreen />;
  return <LoadingScreen />;
}

function LoadingScreen(): React.ReactElement {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={lightJourney.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: lightJourney.background,
    flex: 1,
    justifyContent: 'center',
  },
});
