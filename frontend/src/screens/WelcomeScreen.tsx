import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { saveDemoRole } from '../services/demoRoleStorage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

/**
 * Bespoke opening page — Endorsly's first impression.
 *
 * Formula borrowed from Apple / Linear / Raycast / Revolut welcome screens:
 *   1. Wordmark is the hero: letter-spaced, display weight, vertically centred
 *   2. Two-line promise below: emotional + functional
 *   3. ONE primary CTA pinned near the bottom, accent gradient
 *   4. Subtle radial-ish backdrop, no imagery
 *   5. Zero competing decisions (no "sign in / sign up" split)
 *   6. Staggered fade-in motion (300ms / 600ms / 900ms)
 *
 * Reviewer taps Get started → default role is set and the app opens.
 * Role can be switched anytime from Profile.
 */
export function WelcomeScreen() {
  // Staggered entry animation
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkTranslate, {
        toValue: 0,
        duration: 500,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ctaOpacity, {
        toValue: 1,
        duration: 500,
        delay: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ctaTranslate, {
        toValue: 0,
        duration: 500,
        delay: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [wordmarkOpacity, wordmarkTranslate, taglineOpacity, ctaOpacity, ctaTranslate]);

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Default: Seeker — the swipe deck is the most dopamine-rich first moment
    await saveDemoRole('seeker');
    router.replace('/(seeker-tabs)/discover');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Subtle backdrop — accent glow, not a photo */}
      <LinearGradient
        colors={['rgba(124,58,237,0.18)', 'rgba(124,58,237,0.06)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.container}>
        {/* Hero block — vertically centred in the upper 2/3 */}
        <View style={styles.hero}>
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={[
              styles.wordmark,
              {
                opacity: wordmarkOpacity,
                transform: [{ translateY: wordmarkTranslate }],
              },
            ]}
          >
            ENDORSLY
          </Animated.Text>

          <Animated.View style={{ opacity: taglineOpacity }}>
            <Text style={styles.tagline}>Get referred. Get hired.</Text>
            <Text style={styles.descriptor}>
              Swipe through the people who can refer you.{'\n'}
              Match. Chat. Get hired.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom — CTA + legal micro-copy */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslate }],
            },
          ]}
        >
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [styles.ctaWrap, pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={['#9333ea', '#7c3aed', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Get started</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.legal}>
            Preview build · Switch between Seeker and Endorser view anytime from Profile
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  wordmark: {
    fontFamily: 'Outfit-Bold',
    fontSize: 44,
    color: colors.text,
    letterSpacing: 4,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tagline: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  descriptor: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing[3],
  },

  footer: {
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  ctaWrap: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  cta: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  ctaText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  legal: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    lineHeight: 16,
  },
});
