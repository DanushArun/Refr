import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import {
  identitySteps,
  nextIdentityRoute,
  progressDots,
  type IdentityStepId,
} from './identityOnboarding';

type Props = { step: IdentityStepId };

type Copy = { heading: string; subtitle: string; action: string };

const copies: Record<IdentityStepId, Copy> = {
  basics: {
    action: 'Continue',
    heading: 'Let’s start with the basics',
    subtitle: 'This helps us personalize your experience\nand find the right opportunities.',
  },
  'current-role': {
    action: 'Save experience',
    heading: 'Tell us about your\ncurrent role',
    subtitle: 'Start with your most recent experience.',
  },
  'career-history': {
    action: 'Continue',
    heading: 'Add your career\nhistory',
    subtitle: 'Help us understand your journey so far.',
  },
  education: {
    action: 'Save & continue',
    heading: 'Add your education',
    subtitle: 'Your education helps build trust\nand stronger connections.',
  },
};

function OnboardingHeader({ step }: Props): ReactElement {
  const index = identitySteps.findIndex((item) => item.id === step);
  return (
    <>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.headerAction}>
          <Ionicons color={lightJourney.ink} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.wordmark}>Endorsly</Text>
        <View style={styles.headerAction}>
          <Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={22} />
        </View>
      </View>
      <Text style={styles.stepLabel}>Step {index + 1} of {identitySteps.length}</Text>
      <View accessibilityLabel={`Step ${index + 1} of 4`} style={styles.progress}>
        {progressDots(index).map((dot, dotIndex) => (
          <View key={identitySteps[dotIndex].id} style={styles.progressItem}>
            <View style={[styles.dot, dot !== 'upcoming' && styles.dotActive]} />
            {dotIndex < identitySteps.length - 1 ? <View style={[styles.line, dot === 'complete' && styles.lineActive]} /> : null}
          </View>
        ))}
      </View>
    </>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: ReactElement }): ReactElement {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.field}>
        {icon}
        <Text style={styles.fieldValue}>{value}</Text>
        <Ionicons color={lightJourney.textMuted} name="chevron-down" size={16} />
      </View>
    </View>
  );
}

function BasicsPanel(): ReactElement {
  const [name, setName] = useState('Priya Nair');
  return (
    <View style={styles.panel}>
      <Text style={styles.avatarLabel}>Choose your avatar</Text>
      <View style={styles.avatarWrap}>
        <Image source={require('../../assets/seeker-entry-portrait.png')} style={styles.avatar} />
        <Pressable accessibilityLabel="Edit profile photo" accessibilityRole="button" style={styles.editAvatar}>
          <Ionicons color={lightJourney.ink} name="pencil-outline" size={20} />
        </Pressable>
      </View>
      <Text style={styles.fieldLabel}>Full name</Text>
      <TextInput accessibilityLabel="Full name" onChangeText={setName} style={styles.textInput} value={name} />
      <Field
        icon={<Ionicons color={lightJourney.textMuted} name="location-outline" size={17} />}
        label="Current location"
        value="Bengaluru, Karnataka"
      />
    </View>
  );
}

function CurrentRolePanel(): ReactElement {
  return (
    <View style={[styles.panel, styles.experienceCard]}>
      <View style={styles.companyRow}>
        <View style={styles.companyBadge}><Text style={styles.companyMark}>C</Text></View>
        <Text style={styles.companyName}>CRED</Text>
      </View>
      <Field label="Current role" value="Senior Product Manager" />
      <Field label="Company" value="CRED" />
      <View style={styles.fieldRow}>
        <View style={styles.smallField}><Field label="Start date" value="Jun 2021" /></View>
        <View style={styles.smallField}><Field label="Employment type" value="Full-time" /></View>
      </View>
      <View style={styles.emailCard}>
        <Ionicons color={lightJourney.ink} name="mail-outline" size={19} />
        <View style={styles.emailCopy}><Text style={styles.emailTitle}>Verify your work email (optional)</Text><Text style={styles.email}>priya.nair@cred.club</Text></View>
        <Text style={styles.verifiedInline}>Verified</Text>
      </View>
      <Text style={styles.helper}>We’ll never share your email.</Text>
    </View>
  );
}

function JobCard({ company, role, period }: { company: string; role: string; period: string }): ReactElement {
  return (
    <View style={styles.jobCard}>
      <View style={styles.companyBadge}><Text style={styles.companyMark}>{company.slice(0, 1)}</Text></View>
      <View style={styles.jobCopy}><Text style={styles.jobRole}>{role}</Text><Text style={styles.jobPeriod}>{period}</Text><View style={styles.duration}><Ionicons color={lightJourney.textMuted} name="time-outline" size={14} /><Text style={styles.durationText}>2 yrs</Text></View></View>
      <Ionicons color={lightJourney.ink} name="pencil-outline" size={19} />
    </View>
  );
}

function CareerHistoryPanel(): ReactElement {
  return (
    <View style={styles.panel}>
      <JobCard company="PhonePe" period="2019 – 2021" role="Product Manager" />
      <JobCard company="Paytm" period="2017 – 2019" role="Associate Product Manager" />
      <Pressable accessibilityLabel="Add earlier experience" accessibilityRole="button" style={styles.addAction}>
        <Ionicons color={lightJourney.blue} name="add-circle-outline" size={21} />
        <Text style={styles.addText}>Add earlier experience</Text>
      </Pressable>
    </View>
  );
}

function EducationPanel(): ReactElement {
  return (
    <View style={[styles.panel, styles.educationCard]}>
      <View style={styles.companyRow}>
        <View style={styles.schoolBadge}><Ionicons color={lightJourney.ink} name="school-outline" size={27} /></View>
        <Text style={styles.schoolName}>IIT Bombay</Text>
        <Text style={styles.verifiedInline}>Verified</Text>
      </View>
      <Field label="Degree" value="B.Tech" />
      <Field label="Field of study" value="Computer Science & Engineering" />
      <Field label="Graduation year" value="2017" />
      <View style={styles.verificationCard}>
        <Ionicons color={lightJourney.green} name="shield-checkmark-outline" size={29} />
        <View><Text style={styles.verificationTitle}>Verified education source</Text><Text style={styles.verificationText}>Confirmed by official records</Text><Text style={styles.learnMore}>Learn more</Text></View>
      </View>
    </View>
  );
}

function StepPanel({ step }: Props): ReactElement {
  if (step === 'basics') return <BasicsPanel />;
  if (step === 'current-role') return <CurrentRolePanel />;
  if (step === 'career-history') return <CareerHistoryPanel />;
  return <EducationPanel />;
}

export function IdentityOnboardingScreen({ step }: Props): ReactElement {
  const copy = copies[step];
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <OnboardingHeader step={step} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={styles.heading}>{copy.heading}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <StepPanel step={step} />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityLabel={copy.action} accessibilityRole="button" onPress={() => router.push(nextIdentityRoute(step) as never)} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
          <Text style={styles.primaryText}>{copy.action}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 18 },
  headerAction: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  stepLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 1, textAlign: 'center' },
  progress: { alignSelf: 'center', flexDirection: 'row', marginTop: 9 },
  progressItem: { alignItems: 'center', flexDirection: 'row' },
  dot: { backgroundColor: lightJourney.background, borderColor: lightJourney.border, borderRadius: 5, borderWidth: 1, height: 10, width: 10 },
  dotActive: { backgroundColor: lightJourney.blue, borderColor: lightJourney.blue },
  line: { backgroundColor: lightJourney.border, height: 1, width: 21 },
  lineActive: { backgroundColor: lightJourney.blue },
  scroll: { flexGrow: 1, paddingBottom: 12, paddingHorizontal: 28, paddingTop: 20 },
  heading: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 31, letterSpacing: -0.7, lineHeight: 35, textAlign: 'center' },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 12, lineHeight: 18, marginTop: 7, textAlign: 'center' },
  panel: { marginTop: 20 },
  avatarLabel: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 13, textAlign: 'center' },
  avatarWrap: { alignSelf: 'center', borderRadius: 74, height: 148, marginBottom: 13, marginTop: 11, overflow: 'visible', width: 148 },
  avatar: { borderRadius: 74, height: '100%', width: '100%' },
  editAvatar: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 23, borderWidth: 1, bottom: 0, height: 46, justifyContent: 'center', position: 'absolute', right: -8, width: 46 },
  fieldGroup: { marginTop: 9 },
  fieldLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginBottom: 5 },
  field: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 8, borderWidth: 1, flexDirection: 'row', minHeight: 35, paddingHorizontal: 10 },
  fieldValue: { color: lightJourney.text, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 12, marginLeft: 6 },
  textInput: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 8, borderWidth: 1, color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 12, height: 35, paddingHorizontal: 10 },
  experienceCard: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 13, borderWidth: 1, padding: 12 },
  companyRow: { alignItems: 'center', flexDirection: 'row' },
  companyBadge: { alignItems: 'center', backgroundColor: lightJourney.ink, borderRadius: 7, height: 39, justifyContent: 'center', width: 39 },
  companyMark: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 17 },
  companyName: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 14, marginLeft: 9 },
  fieldRow: { flexDirection: 'row', gap: 9 },
  smallField: { flex: 1 },
  emailCard: { alignItems: 'center', backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 9, borderWidth: 1, flexDirection: 'row', marginTop: 13, minHeight: 56, paddingHorizontal: 10 },
  emailCopy: { flex: 1, marginLeft: 9 },
  emailTitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10 },
  email: { color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 3 },
  verifiedInline: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10 },
  helper: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 7, textAlign: 'center' },
  jobCard: { alignItems: 'flex-start', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, flexDirection: 'row', marginBottom: 10, minHeight: 124, padding: 12 },
  jobCopy: { flex: 1, marginLeft: 11 },
  jobRole: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 13, lineHeight: 19 },
  jobPeriod: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 3 },
  duration: { alignItems: 'center', borderTopColor: lightJourney.border, borderTopWidth: 1, flexDirection: 'row', gap: 6, marginTop: 12, paddingTop: 9 },
  durationText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10 },
  addAction: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 9, borderWidth: 1, flexDirection: 'row', height: 41, justifyContent: 'center', marginTop: 1 },
  addText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginLeft: 7 },
  educationCard: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 13, borderWidth: 1, padding: 12 },
  schoolBadge: { alignItems: 'center', borderColor: lightJourney.ink, borderRadius: 19, borderWidth: 1, height: 39, justifyContent: 'center', width: 39 },
  schoolName: { color: lightJourney.text, flex: 1, fontFamily: 'TikTokSans-Medium', fontSize: 14, marginLeft: 9 },
  verificationCard: { alignItems: 'center', backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 11, marginTop: 12, padding: 11 },
  verificationTitle: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  verificationText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  learnMore: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 10, marginTop: 4 },
  footer: { paddingBottom: 18, paddingHorizontal: 24, paddingTop: 7 },
  primary: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' },
  primaryPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  primaryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
