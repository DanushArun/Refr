import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import {
  nextEndorserOnboardingRoute,
  type EndorserOnboardingState,
} from './endorserOnboarding/endorserOnboardingModel';

type Props = { state: EndorserOnboardingState };
type IconName = keyof typeof Ionicons.glyphMap;

function Header({ back = true }: { back?: boolean }): ReactElement {
  return (
    <View style={styles.header}>
      {back ? <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.headerButton}><Ionicons color={lightJourney.ink} name="arrow-back" size={22} /></Pressable> : <View style={styles.headerButton} />}
      <Text style={styles.wordmark}>Endorsly</Text>
      <View style={styles.headerButton}><Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={21} /></View>
    </View>
  );
}

function Primary({ label, path }: { label: string; path: string }): ReactElement {
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={() => router.push(path as never)} style={styles.primary}><Text style={styles.primaryText}>{label}</Text></Pressable>;
}

function Field({ icon, label, value, success }: { icon: IconName; label: string; value: string; success?: boolean }): ReactElement {
  return <View style={styles.field}><Ionicons color={lightJourney.ink} name={icon} size={20} /><View style={styles.copy}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.value}>{value}</Text></View>{success ? <Text style={styles.success}>Verified  ●</Text> : null}</View>;
}

function Work(): ReactElement {
  return <View style={styles.centerContent}>
    <Text accessibilityRole="header" style={styles.title}>Let’s verify your{`\n`}work identity</Text>
    <Text style={styles.subtitle}>This keeps Endorsly trusted and relevant.</Text>
    <View style={styles.section}>
      <Field icon="mail-outline" label="Work email" value="arjun.menon@razorpay.com" />
      <Field icon="logo-linkedin" label="LinkedIn profile" success value="linkedin.com/in/arjunmenon" />
      <Field icon="business-outline" label="Current company" success value="Razorpay" />
    </View>
    <Privacy text="We only use this to verify your work identity and show relevant opportunities. Your data is never shared without consent." />
  </View>;
}

function Checking(): ReactElement {
  return <View style={styles.centerContent}>
    <Text accessibilityRole="header" style={styles.title}>Verifying your{`\n`}work identity</Text>
    <Text style={styles.subtitle}>Usually under a minute.</Text>
    <View style={styles.checkList}>
      <CheckRow detail="razorpay.com" icon="globe-outline" label="Company domain" state="Verified" />
      <CheckRow detail="linkedin.com/in/arjunmenon" icon="logo-linkedin" label="LinkedIn profile" state="Verified" />
      <CheckRow detail="Product Manager" icon="person-outline" label="Current role" state="Checking…" />
      <CheckRow detail="5 yrs at Razorpay" icon="briefcase-outline" label="Work history" state="Pending" />
    </View>
    <Privacy text="We verify and securely store your information. We never post without your permission." />
  </View>;
}

function CheckRow({ detail, icon, label, state }: { detail: string; icon: IconName; label: string; state: string }): ReactElement {
  const verified = state === 'Verified';
  return <View style={styles.checkRow}><Ionicons color={verified ? lightJourney.green : lightJourney.ink} name={icon} size={21} /><View style={styles.copy}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.rowDetail}>{detail}</Text></View><Text style={verified ? styles.success : styles.pending}>{state}</Text></View>;
}

function Verified(): ReactElement {
  return <View style={styles.centerContent}>
    <View style={styles.portraitWrap}>
      <Image source={require('../../assets/arjun-endorser.png')} style={styles.verifiedPortrait} />
      <View style={styles.verifiedBadge}>
        <Ionicons color="#FFFFFF" name="checkmark" size={18} />
      </View>
    </View>
    <Text accessibilityRole="header" style={styles.title}>You’re verified, Arjun.</Text>
    <Text style={styles.subtitle}>Thanks for helping keep Endorsly a trusted space.</Text>
    <View style={styles.summary}><Text style={styles.fieldLabel}>Work verified at</Text><Text style={styles.company}>Razorpay</Text><Text style={styles.rowDetail}>Product Manager  ·  5 yrs</Text><Text style={styles.rowDetail}>Bengaluru  ·  IIT Bombay</Text><Text style={styles.verifiedPill}>Verified</Text></View>
    <Privacy text="Your information is private and never shared without your consent." />
  </View>;
}

function Choice({ detail, icon, label, selected, onPress }: { detail: string; icon?: IconName; label: string; selected: boolean; onPress: () => void }): ReactElement {
  return <Pressable accessibilityLabel={label} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>{icon ? <Ionicons color={lightJourney.ink} name={icon} size={22} /> : null}<View style={[styles.copy, icon && styles.choiceCopy]}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.rowDetail}>{detail}</Text></View><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <Ionicons color="#FFFFFF" name="checkmark" size={14} /> : null}</View></Pressable>;
}

function Roles(): ReactElement {
  const [chosen, setChosen] = useState('Product');
  const roles = [
    ['Product', 'Product Management, Product Strategy, Product Operations', 'briefcase-outline'],
    ['Engineering', 'Software Engineering, SRE, Data Engineering', 'hardware-chip-outline'],
    ['Design', 'UX Design, Product Design, Design Systems', 'color-palette-outline'],
    ['Marketing', 'Growth, Brand, Content, Performance Marketing', 'trending-up-outline'],
    ['Finance', 'Finance, FP&A, FinTech', 'business-outline'],
  ] as const;
  return <View style={styles.content}><Text accessibilityRole="header" style={styles.title}>What roles can you{`\n`}confidently refer?</Text><Text style={styles.subtitle}>Select the roles where you can add the most value.</Text><Text style={styles.label}>Selected (1)</Text>{roles.map(([label, detail, icon]) => <Choice detail={detail} icon={icon} key={label} label={label} onPress={() => setChosen(label)} selected={chosen === label} />)}</View>;
}

function Scope(): ReactElement {
  const [seniority, setSeniority] = useState('Individual Contributor');
  return <View style={styles.content}><Text accessibilityRole="header" style={styles.title}>Set your referral scope</Text><Text style={styles.subtitle}>Choose the levels, locations and functions where you can make a meaningful introduction.</Text><Text style={styles.label}>Seniority</Text><Choice detail="Managers, Directors, VPs" label="Leadership" onPress={() => setSeniority('Leadership')} selected={seniority === 'Leadership'} /><Choice detail="IC1, IC2, IC3 and above" label="Individual Contributor" onPress={() => setSeniority('Individual Contributor')} selected={seniority === 'Individual Contributor'} /><Text style={styles.label}>Locations</Text><Choice detail="" label="Bengaluru" onPress={() => undefined} selected /><Choice detail="" label="Remote (India)" onPress={() => undefined} selected /><Text style={styles.label}>Functions</Text><Choice detail="PM, APM, TPM, Product Ops" label="Product Management" onPress={() => undefined} selected /><Choice detail="Corporate Strategy, Ops Strategy" label="Strategy" onPress={() => undefined} selected /><Choice detail="Sales, Business, Analytics" label="Other Functions" onPress={() => undefined} selected={false} /></View>;
}

function Capacity(): ReactElement {
  const [paused, setPaused] = useState(false);
  return <View style={styles.content}><Text accessibilityRole="header" style={styles.title}>Set your referral capacity{`\n`}& availability</Text><Text style={styles.subtitle}>Your preferences help set expectations for candidates.</Text><View style={styles.section}><Field icon="people-outline" label="Active referral capacity" value="−   3   +" /><Field icon="time-outline" label="Typical reply time" success value="Within 24 hours" /><View style={styles.toggleRow}><View style={styles.copy}><Text style={styles.fieldLabel}>Pause new recommendations</Text><Text style={styles.rowDetail}>Temporarily pause suggestions</Text></View><Pressable accessibilityLabel="Pause new recommendations" accessibilityRole="switch" accessibilityState={{ checked: paused }} onPress={() => setPaused((value) => !value)} style={[styles.toggle, paused && styles.toggleOn]}><View style={[styles.knob, paused && styles.knobOn]} /></Pressable></View></View><Text style={styles.label}>Notification frequency</Text><Choice detail="Instant updates as they happen" label="Real-time" onPress={() => undefined} selected={false} /><Choice detail="Once a day summary" label="Daily digest" onPress={() => undefined} selected /><Choice detail="Once a week summary" label="Weekly digest" onPress={() => undefined} selected={false} /></View>;
}

function Ready(): ReactElement {
  return <View style={styles.centerContent}><View style={styles.portraitWrap}><Image source={require('../../assets/arjun-endorser.png')} style={styles.verifiedPortrait} /><View style={styles.verifiedBadge}><Ionicons color="#FFFFFF" name="checkmark" size={18} /></View></View><Text accessibilityRole="header" style={styles.title}>Your referral desk{`\n`}is ready</Text><Text style={styles.subtitle}>Thanks, Arjun. You’re all set to help amazing people find the right role.</Text><View style={styles.summary}><CheckRow detail="Product Management, Strategy" icon="people-outline" label="Product referrals" state="" /><CheckRow detail="Bengaluru, Remote (India)" icon="location-outline" label="Where you can refer" state="" /><CheckRow detail="Up to 3 active referrals" icon="briefcase-outline" label="Active capacity" state="" /><CheckRow detail="Within 24 hours" icon="time-outline" label="Typical reply time" state="" /></View></View>;
}

function Privacy({ text }: { text: string }): ReactElement { return <View style={styles.privacy}><Ionicons color={lightJourney.ink} name="lock-closed-outline" size={23} /><Text style={styles.privacyText}>{text}</Text></View>; }

function Content({ state }: Props): ReactElement {
  if (state === 'work') return <Work />;
  if (state === 'checking') return <Checking />;
  if (state === 'verified') return <Verified />;
  if (state === 'roles') return <Roles />;
  if (state === 'scope') return <Scope />;
  if (state === 'capacity') return <Capacity />;
  return <Ready />;
}

function actionLabel(state: EndorserOnboardingState): string {
  if (state === 'work') return 'Verify work';
  if (state === 'checking') return 'Continue verification';
  if (state === 'verified') return 'Set my preferences';
  if (state === 'roles') return 'Continue';
  if (state === 'scope') return 'Save & continue';
  if (state === 'capacity') return 'Confirm capacity';
  return 'Meet candidates';
}

export function EndorserOnboardingScreen({ state }: Props): ReactElement {
  const label = actionLabel(state);
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header back={state !== 'ready'} /><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><Content state={state} /></ScrollView><View style={styles.footer}><Primary label={label} path={nextEndorserOnboardingRoute(state)} /></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  content: { paddingTop: 24 },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, lineHeight: 33 },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 7 },
  centerContent: { alignItems: 'center', paddingTop: 34 },
  centerContentTitle: { textAlign: 'center' },
  section: { alignSelf: 'stretch', gap: 10, marginTop: 22 },
  field: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', minHeight: 62, paddingHorizontal: 12 },
  copy: { flex: 1 },
  fieldLabel: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  value: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  rowDetail: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 14, marginTop: 2 },
  success: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10 },
  pending: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10 },
  privacy: { alignItems: 'flex-start', alignSelf: 'stretch', backgroundColor: lightJourney.surfaceMuted, borderRadius: 11, flexDirection: 'row', gap: 11, marginTop: 26, padding: 14 },
  privacyText: { color: lightJourney.textMuted, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 16 },
  checkList: { alignSelf: 'stretch', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 12, borderWidth: 1, marginTop: 22, overflow: 'hidden' },
  checkRow: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 62, paddingHorizontal: 12 },
  portraitWrap: { height: 116, position: 'relative', width: 116 }, verifiedPortrait: { borderRadius: 58, height: 116, width: 116 }, verifiedBadge: { alignItems: 'center', backgroundColor: lightJourney.green, borderColor: lightJourney.background, borderRadius: 18, borderWidth: 3, bottom: 0, height: 36, justifyContent: 'center', position: 'absolute', right: 0, width: 36 },
  summary: { alignSelf: 'stretch', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 12, borderWidth: 1, marginTop: 22, padding: 14 },
  company: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 14, marginTop: 9 },
  verifiedPill: { alignSelf: 'flex-start', backgroundColor: lightJourney.greenSoft, borderRadius: 7, color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10, marginTop: 9, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  label: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 11, marginBottom: 7, marginTop: 19 },
  choice: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', marginTop: 8, minHeight: 62, paddingHorizontal: 12 },
  choiceSelected: { borderColor: lightJourney.blue, borderWidth: 1.5 },
  choiceCopy: { marginLeft: 11 },
  radio: { alignItems: 'center', borderColor: lightJourney.textMuted, borderRadius: 13, borderWidth: 1, height: 26, justifyContent: 'center', width: 26 },
  radioSelected: { backgroundColor: lightJourney.blue, borderColor: lightJourney.blue },
  toggleRow: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', minHeight: 70, paddingHorizontal: 12 },
  toggle: { backgroundColor: lightJourney.border, borderRadius: 16, height: 32, justifyContent: 'center', paddingHorizontal: 3, width: 52 },
  toggleOn: { backgroundColor: lightJourney.blue },
  knob: { backgroundColor: '#FFFFFF', borderRadius: 13, height: 26, width: 26 },
  knobOn: { alignSelf: 'flex-end' },
  footer: { paddingBottom: 18, paddingHorizontal: 24, paddingTop: 8 },
  primary: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
