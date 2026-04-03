import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

// Keep the native splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Commented out since the actual font files are missing
    // 'InstrumentSerif-Regular': require('./assets/fonts/InstrumentSerif-Regular.ttf'),
    // 'InstrumentSerif-Italic': require('./assets/fonts/InstrumentSerif-Italic.ttf'),
    // 'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
    // 'Outfit-Medium': require('./assets/fonts/Outfit-Medium.ttf'),
    // 'Outfit-SemiBold': require('./assets/fonts/Outfit-SemiBold.ttf'),
    // 'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
    // 'JetBrainsMono-Regular': require('./assets/fonts/JetBrainsMono-Regular.ttf'),
    // 'JetBrainsMono-Medium': require('./assets/fonts/JetBrainsMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
