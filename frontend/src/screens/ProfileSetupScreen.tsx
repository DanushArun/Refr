import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { authApi } from '../services/auth';
import type { ProfileSetupScreenProps } from '../types/navigation';

// ─── Step definitions ──────────────────────────────────────────────────────

type SeekerForm = {
  displayName: string;
  email: string;
  password: string;
  headline: string;
  yearsOfExperience: string;
  skills: string;
  targetCompanies: string;
  whyLooking: string;
};

type ReferrerForm = {
  displayName: string;
  email: string;
  password: string;
  company: string;
  department: string;
  jobTitle: string;
  yearsAtCompany: string;
  canReferTo: string;
};

export function ProfileSetupScreen({ route, navigation }: ProfileSetupScreenProps) {
  const { role } = route.params;
  const isSeeker = role === 'seeker';

  const [loading, setLoading] = useState(false);

  const [seekerForm, setSeekerForm] = useState<SeekerForm>({
    displayName: '',
    email: '',
    password: '',
    headline: '',
    yearsOfExperience: '',
    skills: '',
    targetCompanies: '',
    whyLooking: '',
  });

  const [referrerForm, setReferrerForm] = useState<ReferrerForm>({
    displayName: '',
    email: '',
    password: '',
    company: '',
    department: '',
    jobTitle: '',
    yearsAtCompany: '',
    canReferTo: '',
  });

  const handleSeekerSubmit = async () => {
    setLoading(true);
    try {
      await authApi.signupSeeker({
        displayName: seekerForm.displayName,
        email: seekerForm.email,
        password: seekerForm.password,
        headline: seekerForm.headline,
        yearsOfExperience: parseInt(seekerForm.yearsOfExperience, 10),
        skills: seekerForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        targetCompanies: seekerForm.targetCompanies.split(',').map((s) => s.trim()).filter(Boolean),
        whyLooking: seekerForm.whyLooking,
      });
      // Auth hook handles navigation via session change
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReferrerSubmit = async () => {
    setLoading(true);
    try {
      await authApi.signupReferrer({
        displayName: referrerForm.displayName,
        email: referrerForm.email,
        password: referrerForm.password,
        company: referrerForm.company,
        department: referrerForm.department,
        jobTitle: referrerForm.jobTitle,
        yearsAtCompany: parseInt(referrerForm.yearsAtCompany, 10),
        canReferTo: referrerForm.canReferTo.split(',').map((s) => s.trim()).filter(Boolean),
      });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>
            {isSeeker ? 'Your story' : 'Your profile'}
          </Text>
          <Text style={styles.subheading}>
            {isSeeker
              ? 'Help referrers understand who you are. Be specific — generic profiles get fewer referrals.'
              : 'Tell potential seekers what you can champion. Verified profiles get more requests.'}
          </Text>

          {isSeeker ? (
            <View style={styles.form}>
              <Input
                label="Full name"
                value={seekerForm.displayName}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, displayName: v }))}
                placeholder="Arjun Mehta"
              />
              <Input
                label="Work email"
                value={seekerForm.email}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, email: v }))}
                placeholder="arjun@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={seekerForm.password}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, password: v }))}
                secureTextEntry
                placeholder="At least 8 characters"
              />
              <Input
                label="One-line headline"
                value={seekerForm.headline}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, headline: v }))}
                placeholder="Backend engineer, 4y at Flipkart, moving to fintech"
                maxLength={120}
              />
              <Input
                label="Years of experience"
                value={seekerForm.yearsOfExperience}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, yearsOfExperience: v }))}
                placeholder="4"
                keyboardType="numeric"
              />
              <Input
                label="Skills (comma separated)"
                value={seekerForm.skills}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, skills: v }))}
                placeholder="Node.js, PostgreSQL, System Design"
              />
              <Input
                label="Companies you want to join"
                value={seekerForm.targetCompanies}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, targetCompanies: v }))}
                placeholder="Zepto, Razorpay, Swiggy"
              />
              <Input
                label="Why are you looking?"
                value={seekerForm.whyLooking}
                onChangeText={(v) => setSeekerForm((f) => ({ ...f, whyLooking: v }))}
                placeholder="Be honest. Referrers appreciate authenticity."
                multiline
                numberOfLines={4}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Full name"
                value={referrerForm.displayName}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, displayName: v }))}
                placeholder="Priya Sharma"
              />
              <Input
                label="Work email"
                value={referrerForm.email}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, email: v }))}
                placeholder="priya@swiggy.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={referrerForm.password}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, password: v }))}
                secureTextEntry
                placeholder="At least 8 characters"
              />
              <Input
                label="Company"
                value={referrerForm.company}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, company: v }))}
                placeholder="Swiggy"
              />
              <Input
                label="Department"
                value={referrerForm.department}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, department: v }))}
                placeholder="Engineering"
              />
              <Input
                label="Job title"
                value={referrerForm.jobTitle}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, jobTitle: v }))}
                placeholder="Senior Software Engineer"
              />
              <Input
                label="Years at company"
                value={referrerForm.yearsAtCompany}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, yearsAtCompany: v }))}
                placeholder="2"
                keyboardType="numeric"
              />
              <Input
                label="Teams you can refer for (comma separated)"
                value={referrerForm.canReferTo}
                onChangeText={(v) => setReferrerForm((f) => ({ ...f, canReferTo: v }))}
                placeholder="Backend, Platform, Data"
              />
            </View>
          )}

          <Button
            label={loading ? 'Creating account...' : 'Create account'}
            onPress={isSeeker ? handleSeekerSubmit : handleReferrerSubmit}
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  kav: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
    gap: spacing[6],
  },
  heading: { ...typography.h2, color: colors.text },
  subheading: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  form: { gap: spacing[4] },
  submitBtn: { marginTop: spacing[4] },
});
