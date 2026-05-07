import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SystemBars } from 'react-native-edge-to-edge';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { colors } from '../src/theme/colors';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Body + UI — Inter, the modern fintech/SaaS standard (Vercel, Linear, Notion)
    'Outfit-Regular': Inter_400Regular,
    'Outfit-Medium': Inter_500Medium,
    'Outfit-SemiBold': Inter_600SemiBold,
    'Outfit-Bold': Inter_700Bold,
    // Reserved for hero/editorial moments (splash, match modal, earnings hero label)
    'InstrumentSerif-Regular': InstrumentSerif_400Regular,
    'InstrumentSerif-Italic': InstrumentSerif_400Regular_Italic,
    // Numbers + stats — JetBrains Mono (closest free cousin of Geist Mono)
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Medium': JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider>
          <SystemBars style="light" hidden={false} />
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
