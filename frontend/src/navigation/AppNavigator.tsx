import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { useAuth } from '../hooks/useAuth';
import { SeekerTabNavigator } from './SeekerTabNavigator';
import { ReferrerTabNavigator } from './ReferrerTabNavigator';
import { ChatScreen } from '../screens/ChatScreen';
import { colors } from '../theme/colors';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Root = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator is the root navigator.
 *
 * Auth state drives the tree:
 *   - No session  → AuthNavigator (Splash → RoleSelection → ProfileSetup)
 *   - Session, seeker role  → SeekerTabNavigator + Chat modal
 *   - Session, referrer role → ReferrerTabNavigator + Chat modal
 *
 * The Main group uses a native stack so Chat slides over the tab UI.
 */
export function AppNavigator() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isAuthenticated = !!session;
  const isReferrer = user?.role === 'referrer';

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Root.Screen name="Main">
            {() => (
              <MainNavigator isReferrer={isReferrer} />
            )}
          </Root.Screen>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

// ─── Inner Main Stack ───────────────────────────────────────────────────────

import { createNativeStackNavigator as createMainStack } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../types/navigation';

const Main = createMainStack<MainStackParamList>();

function MainNavigator({ isReferrer }: { isReferrer: boolean }) {
  return (
    <Main.Navigator screenOptions={{ headerShown: false }}>
      {isReferrer ? (
        <Main.Screen name="ReferrerTabs" component={ReferrerTabNavigator} />
      ) : (
        <Main.Screen name="SeekerTabs" component={SeekerTabNavigator} />
      )}
      <Main.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: 'Outfit-SemiBold', fontSize: 17 },
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Main.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
