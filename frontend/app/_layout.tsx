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

const ROOT_STACK_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
  animation: 'none',
  gestureEnabled: true,
} as const;

export default function RootLayout(): React.ReactElement | null {
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
      <GestureHandlerRootView style={styles.appRoot}>
        <SafeAreaProvider style={styles.safeAreaProvider}>
          <SystemBars style="light" hidden={false} />
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <View style={styles.backgroundLayer} pointerEvents="none">
            <AuroraShader speed={0.85} />
          </View>
          <View style={styles.routeLayer}>
            <Stack screenOptions={ROOT_STACK_SCREEN_OPTIONS} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeAreaProvider: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 0,
  },
  routeLayer: {
    flex: 1,
    zIndex: 1,
  },
});
