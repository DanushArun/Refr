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
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
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
    // Body + UI — Satoshi (the free Gilroy; CRED-grade geometric sans)
    // Aliased to legacy "Outfit-*" keys so existing components render without edits
    'Outfit-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Outfit-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Outfit-SemiBold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Outfit-Bold': require('../assets/fonts/Satoshi-Black.otf'),
    // Hero / editorial — Clash Display (replaces Instrument Serif)
    // CRED does not use a serif — geometric display is the correct brand move
    'InstrumentSerif-Regular': require('../assets/fonts/ClashDisplay-Semibold.otf'),
    'InstrumentSerif-Italic': require('../assets/fonts/ClashDisplay-Medium.otf'),
    // Numbers + stats — JetBrains Mono retained (CRED uses a mono for amounts)
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
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
