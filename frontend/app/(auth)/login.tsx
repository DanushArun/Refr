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
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { signInWithEmail } from '../../src/services/auth';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // Session is saved inside signInWithEmail via saveSession.
    // useAuth in index.tsx reacts to the auth change event and redirects.
    setLoading(false);
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
          <View style={styles.header}>
            <Text style={styles.wordmark}>REFR</Text>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>
              Sign in to your account to continue building your network.
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[10],
    paddingBottom: spacing[12],
    gap: spacing[8],
    justifyContent: 'center',
  },
  header: {
    gap: spacing[2],
  },
  wordmark: {
    ...typography.h3,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: spacing[4],
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: spacing[4],
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
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
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
  },
});
