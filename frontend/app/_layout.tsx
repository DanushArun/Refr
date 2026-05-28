import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
        <SafeAreaProvider>
          <SystemBars style="light" hidden={false} />
          <StatusBar style="light" backgroundColor="transparent" translucent />
          {/* Global aurora — sits behind every route so the atmosphere is
              constant across navigation. Pointer events disabled so it never
              steals taps from the foreground UI. */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <AuroraShader speed={0.85} />
          </View>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              // Native-driven slide-from-right with the system's default 350ms
              // spring on iOS / Material on Android. Enabling this animation
              // explicitly (rather than the route group default which can be
              // 'none' when nested under a global view) gives every push/pop
              // a consistent, fluid transition.
              animation: 'slide_from_right',
              animationDuration: 280,
              gestureEnabled: true,
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
