import React, { useState, useCallback } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { authApi } from '../../src/services/auth';

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

export default function ProfileSetupScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
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

  const handleSeekerChange = useCallback((name: string, value: string) => {
    setSeekerForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleReferrerChange = useCallback((name: string, value: string) => {
    setReferrerForm((f) => ({ ...f, [name]: value }));
  }, []);

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
          nestedScrollEnabled={true}
          keyboardDismissMode="interactive"
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
                name="displayName"
                value={seekerForm.displayName}
                onChangeValue={handleSeekerChange}
                placeholder="Danush Arun"
              />
              <Input
                label="Work email"
                name="email"
                value={seekerForm.email}
                onChangeValue={handleSeekerChange}
                placeholder="danush@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                name="password"
                value={seekerForm.password}
                onChangeValue={handleSeekerChange}
                secureTextEntry
                placeholder="At least 8 characters"
              />
              <Input
                label="One-line headline"
                name="headline"
                value={seekerForm.headline}
                onChangeValue={handleSeekerChange}
                placeholder="Backend engineer, 4y at Flipkart, moving to fintech"
                maxLength={120}
              />
              <Input
                label="Years of experience"
                name="yearsOfExperience"
                value={seekerForm.yearsOfExperience}
                onChangeValue={handleSeekerChange}
                placeholder="4"
                keyboardType="numeric"
              />
              <Input
                label="Skills (comma separated)"
                name="skills"
                value={seekerForm.skills}
                onChangeValue={handleSeekerChange}
                placeholder="Node.js, PostgreSQL, System Design"
              />
              <Input
                label="Companies you want to join"
                name="targetCompanies"
                value={seekerForm.targetCompanies}
                onChangeValue={handleSeekerChange}
                placeholder="Zepto, Razorpay, Swiggy"
              />
              <Input
                label="Why are you looking?"
                name="whyLooking"
                value={seekerForm.whyLooking}
                onChangeValue={handleSeekerChange}
                placeholder="Be honest. Referrers appreciate authenticity."
                multiline
                numberOfLines={4}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Full name"
                name="displayName"
                value={referrerForm.displayName}
                onChangeValue={handleReferrerChange}
                placeholder="Priya Sharma"
              />
              <Input
                label="Work email"
                name="email"
                value={referrerForm.email}
                onChangeValue={handleReferrerChange}
                placeholder="priya@swiggy.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                name="password"
                value={referrerForm.password}
                onChangeValue={handleReferrerChange}
                secureTextEntry
                placeholder="At least 8 characters"
              />
              <Input
                label="Company"
                name="company"
                value={referrerForm.company}
                onChangeValue={handleReferrerChange}
                placeholder="Swiggy"
              />
              <Input
                label="Department"
                name="department"
                value={referrerForm.department}
                onChangeValue={handleReferrerChange}
                placeholder="Engineering"
              />
              <Input
                label="Job title"
                name="jobTitle"
                value={referrerForm.jobTitle}
                onChangeValue={handleReferrerChange}
                placeholder="Senior Software Engineer"
              />
              <Input
                label="Years at company"
                name="yearsAtCompany"
                value={referrerForm.yearsAtCompany}
                onChangeValue={handleReferrerChange}
                placeholder="2"
                keyboardType="numeric"
              />
              <Input
                label="Teams you can refer for (comma separated)"
                name="canReferTo"
                value={referrerForm.canReferTo}
                onChangeValue={handleReferrerChange}
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
    flexGrow: 1,
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: 120,
    gap: spacing[6],
  },
  heading: { ...typography.h2, color: colors.text },
  subheading: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  form: { gap: spacing[4] },
  submitBtn: { marginTop: spacing[4] },
});
