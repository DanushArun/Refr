import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Phrase } from '../utils/haptics';
import { OnboardingConstellation } from '../components/constellation/OnboardingConstellation';
import { getDemoGalaxy } from '../components/constellation/demoGalaxy';
import { colors } from '../theme/colors';

/**
 * The bespoke first-launch ritual. The user watches their galaxy form,
 * star by star, then is invited into the app.
 *
 * After completion the constellation lingers, the "Continue" CTA fades in,
 * and tapping it sends them to role selection.
 */
export function OnboardingScreen() {
  const galaxy = useMemo(() => getDemoGalaxy(), []);

  const handleContinue = useCallback(() => {
    Phrase.tap();
    router.replace('/(auth)/role-selection');
  }, []);

  return (
    <View style={styles.container}>
      <OnboardingConstellation galaxy={galaxy} />

      {/* Always-visible tap target, sits above the choreography */}
      <Pressable
        onPress={handleContinue}
        style={styles.tapTarget}
        accessibilityRole="button"
        accessibilityLabel="Continue to role selection"
      >
        <View style={styles.continueHint}>
          <Text style={styles.continueText}>Tap anywhere to continue</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  tapTarget: { ...StyleSheet.absoluteFillObject },
  continueHint: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  continueText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: 'rgba(250, 250, 247, 0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
