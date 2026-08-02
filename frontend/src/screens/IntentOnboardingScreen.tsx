import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import { intentSteps, nextIntentRoute, selectedSkills, type IntentStep } from './intentOnboarding';

type Props = { step: IntentStep };

const titles: Record<IntentStep, string> = {
  skills: 'Skills', impact: 'Impact highlights', 'target-role': 'Target role', preferences: 'Work preferences',
};

const subtitles: Record<IntentStep, string> = {
  skills: 'Select up to 8 skills that best represent you.',
  impact: 'Add 2–4 achievements that showcase your impact.',
  'target-role': 'Where would you like to go next?',
  preferences: 'Help us personalize opportunities for you.',
};

function Header({ step }: Props): ReactElement {
  const index = intentSteps.indexOf(step);
  return <><View style={styles.header}><Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.headerAction}><Ionicons color={lightJourney.ink} name="arrow-back" size={22} /></Pressable><Text style={styles.wordmark}>Endorsly</Text><View style={styles.headerAction}><Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={22} /></View></View><View style={styles.progress}>{intentSteps.map((item, itemIndex) => <View key={item} style={styles.progressSegment}><View style={[styles.dot, itemIndex <= index && styles.dotActive]} />{itemIndex < 3 ? <View style={[styles.line, itemIndex < index && styles.lineActive]} /> : null}</View>)}</View></>;
}

function ChoiceRow({ label, selected, tag }: { label: string; selected: boolean; tag: string }): ReactElement {
  return <Pressable accessibilityLabel={label} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} style={styles.choiceRow}><View style={[styles.check, selected && styles.checkSelected]}>{selected ? <Ionicons color="#FFFFFF" name="checkmark" size={15} /> : null}</View><Text style={styles.choiceText}>{label}</Text><Text style={[styles.tag, selected ? styles.verified : styles.resumeTag]}>{tag}</Text></Pressable>;
}

function Skills(): ReactElement {
  const items = [...selectedSkills, 'User Research', 'Growth', 'Operations', 'Leadership'];
  return <View style={styles.list}>{items.map((item, index) => <ChoiceRow key={item} label={item} selected={index < 4} tag={index < 4 ? 'Verified' : 'From resume'} />)}<Text style={styles.legend}>◉ Verified with portfolio / assessment</Text><Text style={styles.legend}>From resume  Sourced from your resume</Text></View>;
}

function Impact(): ReactElement {
  const items = ['Scaled UPI payments feature to 12M+ monthly transactions, improving success rate by 18%.', 'Reduced fraud disputes by 32% through risk models and real-time monitoring.', 'Launched fraud dashboard used by 4 teams, cutting investigation time by 40%.'];
  return <View style={styles.list}>{items.map((item) => <View key={item} style={styles.impactCard}><Ionicons color={lightJourney.green} name="checkmark-circle" size={22} /><View style={styles.impactCopy}><Text style={styles.impactText}>{item}</Text><Text style={styles.source}>Source: Work sample</Text></View></View>)}<Pressable accessibilityRole="button" style={styles.secondary}><Ionicons color={lightJourney.textMuted} name="add" size={18} /><Text style={styles.secondaryText}>Add another highlight (optional)</Text></Pressable></View>;
}

function Role({ secondary = false }: { secondary?: boolean }): ReactElement {
  return <View style={[styles.roleCard, !secondary && styles.roleSelected]}><View style={[styles.check, !secondary && styles.checkSelected]}>{!secondary ? <Ionicons color="#FFFFFF" name="checkmark" size={15} /> : null}</View><View style={styles.roleCopy}><Text style={styles.roleTitle}>{secondary ? 'Group Product Manager' : 'Senior Product Manager'}</Text><Text style={styles.roleCompany}>Razorpay</Text><Text style={styles.roleMeta}>Bengaluru  ·  Hybrid</Text></View></View>;
}

function TargetRole(): ReactElement {
  return <View style={styles.list}><Text style={styles.fieldLabel}>Primary target role</Text><Role /><Text style={[styles.fieldLabel, styles.sectionGap]}>Secondary target role (optional)</Text><Role secondary /><Text style={[styles.fieldLabel, styles.sectionGap]}>Salary expectation (optional)</Text><View style={styles.locked}><Ionicons color={lightJourney.textMuted} name="lock-closed-outline" size={20} /><View><Text style={styles.lockTitle}>Will be shared later</Text><Text style={styles.lockText}>Range not disclosed</Text></View></View></View>;
}

function PreferenceRow({ icon, label, value }: { icon: 'briefcase-outline' | 'location-outline' | 'cube-outline' | 'compass-outline'; label: string; value: string }): ReactElement {
  return <View style={styles.preference}><Ionicons color={lightJourney.textMuted} name={icon} size={22} /><View style={styles.preferenceCopy}><Text style={styles.preferenceLabel}>{label}</Text><Text style={styles.preferenceValue}>{value}</Text></View><Ionicons color={lightJourney.textMuted} name="chevron-down" size={16} /></View>;
}

function Preferences(): ReactElement {
  return <View style={styles.list}><PreferenceRow icon="briefcase-outline" label="Work type" value="Full-time" /><PreferenceRow icon="location-outline" label="Location" value="Bengaluru" /><PreferenceRow icon="cube-outline" label="Work model" value="Hybrid" /><PreferenceRow icon="compass-outline" label="Industry focus" value="Fintech / Payments" /><Text style={[styles.fieldLabel, styles.sectionGap]}>Notification frequency</Text><Text style={styles.preferenceLabel}>Choose how often you want to receive updates.</Text><View style={styles.frequency}><Text style={styles.frequencyOption}>Low{`\n`}Weekly</Text><Text style={[styles.frequencyOption, styles.frequencySelected]}>Balanced{`\n`}2–3 times a week</Text><Text style={styles.frequencyOption}>High{`\n`}Daily</Text></View></View>;
}

function Panel({ step }: Props): ReactElement {
  if (step === 'skills') return <Skills />;
  if (step === 'impact') return <Impact />;
  if (step === 'target-role') return <TargetRole />;
  return <Preferences />;
}

export function IntentOnboardingScreen({ step }: Props): ReactElement {
  const [ready] = useState(true);
  const label = step === 'preferences' ? 'Review profile' : 'Save & continue';
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header step={step} /><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><Text accessibilityRole="header" style={styles.heading}>{titles[step]}</Text><Text style={styles.subtitle}>{subtitles[step]}</Text><Panel step={step} /></ScrollView><View style={styles.footer}><Pressable accessibilityLabel={label} accessibilityRole="button" disabled={!ready} onPress={() => router.push(nextIntentRoute(step) as never)} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}><Text style={styles.primaryText}>{label}</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 18 },
  headerAction: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  progress: { alignSelf: 'center', flexDirection: 'row', marginTop: 11 },
  progressSegment: { alignItems: 'center', flexDirection: 'row' },
  dot: { backgroundColor: lightJourney.background, borderColor: lightJourney.border, borderRadius: 5, borderWidth: 1, height: 10, width: 10 }, dotActive: { backgroundColor: lightJourney.blue, borderColor: lightJourney.blue },
  line: { backgroundColor: lightJourney.border, height: 1, width: 38 }, lineActive: { backgroundColor: lightJourney.blue },
  scroll: { flexGrow: 1, paddingBottom: 12, paddingHorizontal: 28, paddingTop: 18 },
  heading: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 30, lineHeight: 35 },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 12, lineHeight: 18, marginTop: 7 },
  list: { gap: 8, marginTop: 18 },
  choiceRow: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', minHeight: 42, paddingHorizontal: 10 },
  check: { alignItems: 'center', borderColor: lightJourney.textMuted, borderRadius: 14, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 }, checkSelected: { backgroundColor: lightJourney.blue, borderColor: lightJourney.blue },
  choiceText: { color: lightJourney.text, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 12, marginLeft: 10 },
  tag: { borderRadius: 9, fontFamily: 'TikTokSans-Regular', fontSize: 9, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4 }, verified: { backgroundColor: lightJourney.greenSoft, color: lightJourney.green }, resumeTag: { backgroundColor: lightJourney.blueSoft, color: lightJourney.blue },
  legend: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  impactCard: { alignItems: 'flex-start', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, flexDirection: 'row', minHeight: 102, padding: 12 },
  impactCopy: { flex: 1, marginLeft: 11 }, impactText: { color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 12, lineHeight: 18 }, source: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 9, marginTop: 7 },
  secondary: { alignItems: 'center', borderColor: lightJourney.textMuted, borderRadius: 9, borderStyle: 'dashed', borderWidth: 1, flexDirection: 'row', height: 42, justifyContent: 'center' }, secondaryText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Medium', fontSize: 11, marginLeft: 5 },
  fieldLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11 }, sectionGap: { marginTop: 8 },
  roleCard: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, flexDirection: 'row', minHeight: 82, padding: 12 }, roleSelected: { borderColor: lightJourney.blue, borderWidth: 1.5 }, roleCopy: { marginLeft: 10 }, roleTitle: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 13 }, roleCompany: { color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 2 }, roleMeta: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 5 },
  locked: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 55, paddingHorizontal: 11 }, lockTitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Medium', fontSize: 11 }, lockText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 9, marginTop: 3 },
  preference: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 9, borderWidth: 1, flexDirection: 'row', minHeight: 53, paddingHorizontal: 11 }, preferenceCopy: { flex: 1, marginLeft: 11 }, preferenceLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10 }, preferenceValue: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginTop: 3 },
  frequency: { flexDirection: 'row', gap: 5, marginTop: 8 }, frequencyOption: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 9, borderWidth: 1, color: lightJourney.textMuted, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 17, paddingVertical: 10, textAlign: 'center' }, frequencySelected: { borderColor: lightJourney.blue, color: lightJourney.blue },
  footer: { paddingBottom: 18, paddingHorizontal: 24, paddingTop: 7 }, primary: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' }, primaryPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] }, primaryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
