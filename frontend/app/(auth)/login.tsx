import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { spacing, layout } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { signInWithEmail } from '../../src/services/auth';
import { lightJourney } from '../../src/theme/lightJourney';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelWidth = Math.max(0, Math.min(440, width - spacing[10]));

  const handleChange = useCallback((name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setError(null);
  }, []);

  const handleSignIn = async () => {
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signInWithEmail(form.email.trim(), form.password);

    if (result.error) {
      setError(result.error.message || 'Sign in failed. Check your credentials.');
      setLoading(false);
      return;
    }

    if (!result.user) {
      setError('Sign in response was invalid. Try again.');
      setLoading(false);
      return;
    }

    const role = String(result.user.role ?? 'seeker').toLowerCase();
    const targetPath =
      role === 'referrer'
        ? '/(referrer-tabs)/discover'
        : '/(seeker-tabs)/discover';

    try {
      router.replace(targetPath);
    } catch (navigationError) {
      setError(
        navigationError instanceof Error
          ? navigationError.message
          : 'Navigation to app failed.',
      );
      setLoading(false);
      return;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled={true}
          keyboardDismissMode="interactive"
        >
          <View style={[styles.panel, { width: panelWidth }]}>
            <View style={styles.header}>
              <Text style={styles.wordmark}>Endorsly</Text>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>
              <Text style={styles.heading}>Pick up where your introductions left off.</Text>
              <Text style={styles.subheading}>
                Your referrals, conversations, and career momentum are waiting.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                name="email"
                value={form.email}
                onChangeValue={handleChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <Input
                label="Password"
                name="password"
                value={form.password}
                onChangeValue={handleChange}
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Button
                label="Sign In"
                onPress={handleSignIn}
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerLabel}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/role-selection')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.footerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightJourney.background,
  },
  kav: {
    flex: 1,
    backgroundColor: lightJourney.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: lightJourney.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing[12],
    paddingTop: spacing[10],
  },
  panel: {
    alignSelf: 'center',
    gap: spacing[8],
  },
  header: {
    gap: spacing[2],
    paddingHorizontal: 2,
  },
  wordmark: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 30,
    letterSpacing: -0.4,
    marginBottom: spacing[5],
  },
  eyebrow: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  heading: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 34,
    letterSpacing: -0.7,
    lineHeight: 39,
  },
  subheading: {
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  form: {
    gap: spacing[4],
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: lightJourney.error,
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: {
    color: lightJourney.error,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 13,
  },
  actions: {
    gap: spacing[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
    paddingTop: spacing[2],
  },
  footerLabel: {
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 13,
  },
  footerLink: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 13,
  },
});
