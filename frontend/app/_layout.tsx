import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SystemBars } from 'react-native-edge-to-edge';
import {
  IBMPlexSerif_400Regular,
  IBMPlexSerif_400Regular_Italic,
  IBMPlexSerif_500Medium,
} from '@expo-google-fonts/ibm-plex-serif';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { loadDemoRole } from '../src/services/demoRoleStorage';

SplashScreen.preventAutoHideAsync();

const CabinetGroteskRegular = require('../assets/fonts/CabinetGrotesk-Regular.ttf');
const CabinetGroteskMedium = require('../assets/fonts/CabinetGrotesk-Medium.ttf');
const GeistMonoRegular = require('../assets/fonts/GeistMono-Regular.ttf');
const GeistMonoMedium = require('../assets/fonts/GeistMono-Medium.ttf');
const TikTokSansRegular = require('../assets/fonts/TikTokSans-Regular.ttf');
const TikTokSansMedium = require('../assets/fonts/TikTokSans-Medium.ttf');
const TikTokSansSemibold = require('../assets/fonts/TikTokSans-Semibold.ttf');
const OxaniumBold = require('../assets/fonts/Oxanium-Bold.ttf');
const ChakraPetchBold = require('../assets/fonts/ChakraPetch-Bold.ttf');

const ROOT_STACK_ANIMATION = Platform.OS === 'android' ? 'ios_from_right' : 'default';

const ROOT_STACK_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
  animation: ROOT_STACK_ANIMATION,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
} as const;

export default function RootLayout(): React.ReactElement | null {
  const [demoRoleReady, setDemoRoleReady] = useState(false);
  useEffect(() => {
    loadDemoRole().finally(() => setDemoRoleReady(true));
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'CabinetGrotesk-Regular': CabinetGroteskRegular,
    'CabinetGrotesk-Medium': CabinetGroteskMedium,
    'GeistMono-Regular': GeistMonoRegular,
    'GeistMono-Medium': GeistMonoMedium,
    'TikTokSans-Regular': TikTokSansRegular,
    'TikTokSans-Medium': TikTokSansMedium,
    'TikTokSans-Semibold': TikTokSansSemibold,
    'Outfit-Regular': TikTokSansRegular,
    'Outfit-Medium': TikTokSansMedium,
    'Outfit-SemiBold': TikTokSansSemibold,
    'Outfit-Bold': TikTokSansSemibold,
    'IBMPlexSerif-Regular': IBMPlexSerif_400Regular,
    'IBMPlexSerif-Italic': IBMPlexSerif_400Regular_Italic,
    'IBMPlexSerif-Medium': IBMPlexSerif_500Medium,
    'InstrumentSerif-Regular': IBMPlexSerif_400Regular,
    'InstrumentSerif-Italic': IBMPlexSerif_400Regular_Italic,
    'JetBrainsMono-Regular': GeistMonoRegular,
    'JetBrainsMono-Medium': GeistMonoMedium,
    'MoneyFont-Bold': OxaniumBold,
    'TechFont-Bold': ChakraPetchBold,
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
          <View style={styles.backgroundLayer} pointerEvents="none" />
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
