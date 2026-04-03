import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { SplashScreenProps } from '../types/navigation';

export function SplashScreen({ navigation }: SplashScreenProps) {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.92);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('RoleSelection');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.wordmark}>REFR</Text>
        <Text style={styles.tagline}>Where Bangalore tech hires happen</Text>
      </Animated.View>

      <Text style={styles.footer}>Professional Intelligence · Bangalore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  wordmark: {
    ...typography.display,
    color: colors.text,
    letterSpacing: 8,
    fontSize: 52,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    ...typography.caption,
    color: colors.textTertiary,
    position: 'absolute',
    bottom: 48,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
