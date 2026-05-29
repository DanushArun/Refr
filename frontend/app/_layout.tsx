import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SystemBars } from 'react-native-edge-to-edge';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexSerif_600SemiBold,
  IBMPlexSerif_600SemiBold_Italic,
} from '@expo-google-fonts/ibm-plex-serif';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { loadDemoRole } from '../src/services/demoRoleStorage';
import { AuroraShader } from '../src/components/constellation/AuroraShader';
import { getSession } from '../src/services/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('[route-debug] RootLayout render');
  const [demoRoleReady, setDemoRoleReady] = useState(false);
  useEffect(() => {
    loadDemoRole().finally(() => setDemoRoleReady(true));
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': IBMPlexSans_400Regular,
    'Outfit-Medium': IBMPlexSans_500Medium,
    'Outfit-SemiBold': IBMPlexSans_600SemiBold,
    'Outfit-Bold': IBMPlexSans_700Bold,
    'InstrumentSerif-Regular': IBMPlexSerif_600SemiBold,
    'InstrumentSerif-Italic': IBMPlexSerif_600SemiBold_Italic,
    'JetBrainsMono-Regular': IBMPlexMono_400Regular,
    'JetBrainsMono-Medium': IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && demoRoleReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, demoRoleReady]);

  if ((!fontsLoaded && !fontError) || !demoRoleReady) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider style={styles.safeAreaProvider}>
          <SystemBars style="light" hidden={false} />
          <StatusBar style="light" backgroundColor="transparent" translucent />
          {/* Global aurora — sits behind every route so the atmosphere is
              constant across navigation. Pointer events disabled so it never
              steals taps from the foreground UI. */}
          <View
            style={[StyleSheet.absoluteFillObject, styles.backgroundLayer]}
            pointerEvents="none"
          >
            <AuroraShader speed={0.85} />
          </View>
          <View style={styles.routeLayer}>
            <Text style={styles.providerDebugText}>PROVIDER</Text>
            <LaunchRouteReset />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'none',
                gestureEnabled: true,
              }}
            />
          </View>
        </SafeAreaProvider>
        <Text style={styles.debugText}>ROOT</Text>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function LaunchRouteReset() {
  const pathname = usePathname();
  const [hasCheckedLaunchRoute, setHasCheckedLaunchRoute] = useState(false);

  useEffect(() => {
    console.log('[route-debug] LaunchRouteReset effect', { pathname, hasCheckedLaunchRoute });
    if (hasCheckedLaunchRoute) return;

    getSession()
      .then((session) => {
        const role = session?.user.role;
        console.log('[route-debug] LaunchRouteReset session', { pathname, role });
        if (!role || pathname === '/' || pathname === '/discover') return;
        if (pathname.startsWith('/login') || pathname.startsWith('/role-selection')) return;

        const target = role === 'referrer'
          ? '/(referrer-tabs)/discover'
          : '/(seeker-tabs)/discover';
        router.replace(target);
      })
      .finally(() => setHasCheckedLaunchRoute(true));
  }, [hasCheckedLaunchRoute, pathname]);

  return null;
}

const styles = StyleSheet.create({
  safeAreaProvider: {
    flex: 1,
  },
  backgroundLayer: {
    zIndex: 0,
  },
  routeLayer: {
    flex: 1,
    zIndex: 1,
  },
  debugText: {
    position: 'absolute',
    top: 120,
    left: 24,
    color: '#ffffff',
    fontSize: 32,
    zIndex: 1000,
  },
  providerDebugText: {
    color: '#ffffff',
    fontSize: 32,
    position: 'absolute',
    top: 220,
    left: 24,
    zIndex: 1000,
  },
});
