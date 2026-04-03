import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    setAppIsReady(true);
    SplashScreen.hideAsync();
  }, []);

  if (!appIsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <SystemBars style="light" hidden={false} />
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Stack screenOptions={{ 
          headerShown: false, 
          contentStyle: { backgroundColor: colors.background } 
        }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
