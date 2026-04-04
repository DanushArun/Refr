import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'seeker') {
    return <Redirect href="/(seeker-tabs)/discover" />;
  } else {
    return <Redirect href="/(referrer-tabs)/inbox" />;
  }
}
