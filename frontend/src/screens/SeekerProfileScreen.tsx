import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import type { SeekerProfileState } from './seekerProfile/seekerProfileModel';

type Props = { state: SeekerProfileState };
type IconName = keyof typeof Ionicons.glyphMap;

type RowProps = {
  icon: IconName;
  title: string;
  detail?: string;
  value?: string;
  tone?: 'default' | 'success' | 'danger';
  onPress?: () => void;
};

function Header({ back }: { back: boolean }): ReactElement {
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={lightJourney.ink} name="arrow-back" size={23} />
        </Pressable>
      ) : <View style={styles.iconButton} />}
      <Text style={styles.wordmark}>Endorsly</Text>
      <View style={styles.iconButton}>
        <Ionicons color={lightJourney.ink} name={back ? 'shield-checkmark-outline' : 'settings-outline'} size={22} />
      </View>
    </View>
  );
}

function DetailRow({ icon, title, detail, value, tone = 'default', onPress }: RowProps): ReactElement {
  const content = (
    <>
      <Ionicons color={tone === 'danger' ? lightJourney.error : lightJourney.ink} name={icon} size={22} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, tone === 'danger' && styles.dangerText]}>{title}</Text>
        {detail ? <Text style={[styles.rowDetail, tone === 'danger' && styles.dangerText]}>{detail}</Text> : null}
      </View>
      {value ? <Text style={[styles.rowValue, tone === 'success' && styles.successText]}>{value}</Text> : null}
      {onPress ? <Ionicons color={lightJourney.textMuted} name="chevron-forward" size={18} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={styles.row}>{content}</Pressable>;
}

function ProfileOverview(): ReactElement {
  return (
    <View style={styles.overview}>
      <View style={styles.avatarWrap}>
        <Image source={require('../../assets/seeker-entry-portrait.png')} style={styles.avatar} />
        <View style={styles.lock}><Ionicons color="#FFFFFF" name="lock-closed" size={14} /></View>
      </View>
      <Text accessibilityRole="header" style={styles.name}>Priya Nair</Text>
      <Text style={styles.role}>Senior Product Manager at CRED</Text>
      <Text style={styles.meta}>Bengaluru, Karnataka   ·   7 years</Text>
      <Text style={styles.meta}>IIT Bombay</Text>
      <View style={styles.strength}>
        <View style={styles.score}><Text style={styles.scoreText}>92%</Text></View>
        <View style={styles.strengthCopy}>
          <Text style={styles.strengthTitle}>Profile strength</Text>
          <Text style={styles.strengthText}>Excellent profile. You’re visible to the right opportunities.</Text>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Target roles (2)</Text>
      <View style={styles.listCard}>
        <RoleRow role="Senior Product Manager" company="Razorpay" fit="92% fit" />
        <RoleRow role="Product Manager" company="Payments · Fintech" fit="88% fit" />
      </View>
      <Pressable accessibilityLabel="Edit profile" accessibilityRole="button" style={styles.outlineButton}>
        <Text style={styles.outlineText}>Edit profile</Text>
      </Pressable>
      <Pressable accessibilityLabel="Referral history" accessibilityRole="button" onPress={() => router.push('/(seeker-tabs)/pipeline' as never)} style={styles.history}>
        <View>
          <Text style={styles.rowTitle}>Referral history</Text>
          <Text style={styles.rowDetail}>1 referral active</Text>
          <Text style={styles.rowDetail}>1 offer accepted</Text>
        </View>
        <Ionicons color={lightJourney.textMuted} name="chevron-forward" size={18} />
      </Pressable>
    </View>
  );
}

function RoleRow({ role, company, fit }: { role: string; company: string; fit: string }): ReactElement {
  return (
    <View style={styles.roleRow}>
      <View style={styles.rowCopy}><Text style={styles.roleTitle}>{role}</Text><Text style={styles.rowDetail}>{company}</Text></View>
      <Text style={styles.fit}>{fit}</Text>
    </View>
  );
}

function Documents(): ReactElement {
  return (
    <View>
      <Text accessibilityRole="header" style={styles.pageTitle}>Documents & verification</Text>
      <Text style={styles.pageSubtitle}>Keep your information up to date and verified.</Text>
      <View style={styles.listCard}>
        <DetailRow detail="Current · Updated 15 Jun 2026" icon="document-text" title="Resume" value="Replace" />
        <DetailRow detail="Verified · CRED" icon="briefcase-outline" title="Work verification" tone="success" value="Verified  ●" />
        <DetailRow detail="Verified · IIT Bombay" icon="school-outline" title="Education verification" tone="success" value="Verified  ●" />
        <DetailRow detail="Connected" icon="logo-linkedin" title="LinkedIn" tone="success" value="Connected  ●" />
      </View>
      <View style={styles.privateCard}>
        <Ionicons color={lightJourney.ink} name="lock-closed-outline" size={24} />
        <View style={styles.rowCopy}><Text style={styles.rowTitle}>Your documents are private.</Text><Text style={styles.rowDetail}>They are shared only with your consent.</Text><Text style={styles.learn}>Learn more</Text></View>
      </View>
    </View>
  );
}

function ToggleRow({ label, detail }: { label: string; detail: string }): ReactElement {
  const [enabled, setEnabled] = useState(true);
  return (
    <View style={styles.toggleRow}>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{label}</Text><Text style={styles.rowDetail}>{detail}</Text></View>
      <Pressable accessibilityLabel={label} accessibilityRole="switch" accessibilityState={{ checked: enabled }} onPress={() => setEnabled((value) => !value)} style={[styles.toggle, enabled && styles.toggleOn]}>
        <View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} />
      </Pressable>
    </View>
  );
}

function Preferences(): ReactElement {
  return (
    <View>
      <Text accessibilityRole="header" style={styles.pageTitle}>Career preferences</Text>
      <Text style={styles.pageSubtitle}>Tell us what you’re open to.</Text>
      <View style={styles.listCard}>
        <DetailRow detail="Senior Product Manager, Product Manager" icon="briefcase-outline" onPress={() => undefined} title="Target roles (2)" />
        <DetailRow detail="Bengaluru, Karnataka" icon="location-outline" onPress={() => undefined} title="Location preference" />
        <DetailRow detail="Hybrid" icon="home-outline" onPress={() => undefined} title="Work mode" />
      </View>
      <Text style={styles.notifications}>Notifications</Text>
      <Text style={styles.pageSubtitle}>Stay updated on opportunities.</Text>
      <View style={styles.listCard}>
        <ToggleRow detail="New role matches and recommendations" label="Match alerts" />
        <ToggleRow detail="Messages from endorsers & recruiters" label="Message alerts" />
        <ToggleRow detail="Updates on your applications" label="Application updates" />
      </View>
    </View>
  );
}

function Privacy(): ReactElement {
  return (
    <View>
      <Text accessibilityRole="header" style={styles.pageTitle}>Privacy & account</Text>
      <Text style={styles.pageSubtitle}>You’re in control of your data.</Text>
      <View style={styles.listCard}>
        <DetailRow detail="View what you’ve shared and with whom" icon="reader-outline" onPress={() => undefined} title="Shared data history" />
        <DetailRow detail="People who’ve endorsed you" icon="people-outline" onPress={() => undefined} title="Connected endorsers" value="12" />
        <DetailRow detail="Manage people you’ve blocked" icon="ban-outline" onPress={() => undefined} title="Blocked users" value="2" />
      </View>
      <View style={styles.listCard}>
        <DetailRow detail="Password, 2-step verification" icon="shield-checkmark-outline" onPress={() => undefined} title="Security" />
        <DetailRow detail="Export a copy of your data" icon="download-outline" onPress={() => undefined} title="Download my data" />
        <DetailRow detail="FAQs and contact support" icon="help-circle-outline" onPress={() => undefined} title="Help & support" />
      </View>
      <View style={styles.listCard}>
        <DetailRow icon="log-out-outline" onPress={() => undefined} title="Sign out" tone="danger" />
      </View>
      <View style={styles.listCard}>
        <DetailRow detail="Permanent and irreversible" icon="trash-outline" onPress={() => undefined} title="Delete account" tone="danger" />
      </View>
    </View>
  );
}

function Content({ state }: Props): ReactElement {
  if (state === 'overview') return <ProfileOverview />;
  if (state === 'documents') return <Documents />;
  if (state === 'preferences') return <Preferences />;
  return <Privacy />;
}

export function SeekerProfileScreen({ state }: Props): ReactElement {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Header back={state !== 'overview'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Content state={state} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  iconButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  scroll: { flexGrow: 1, paddingBottom: 30, paddingHorizontal: 20 },
  overview: { alignItems: 'center', paddingTop: 6 },
  avatarWrap: { height: 122, position: 'relative', width: 122 },
  avatar: { borderRadius: 61, height: 122, width: 122 },
  lock: { alignItems: 'center', backgroundColor: lightJourney.ink, borderColor: lightJourney.background, borderRadius: 18, borderWidth: 3, bottom: 3, height: 36, justifyContent: 'center', position: 'absolute', right: 0, width: 36 },
  name: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 9 },
  role: { color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 12, marginTop: 3 },
  meta: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 17 },
  strength: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: lightJourney.greenSoft, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', marginTop: 15, padding: 11 },
  score: { alignItems: 'center', borderColor: lightJourney.green, borderRadius: 24, borderWidth: 3, height: 48, justifyContent: 'center', width: 48 },
  scoreText: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  strengthCopy: { flex: 1, marginLeft: 11 },
  strengthTitle: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  strengthText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 14, marginTop: 2 },
  sectionLabel: { alignSelf: 'stretch', color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 11, marginTop: 14 },
  listCard: { alignSelf: 'stretch', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  roleRow: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 53, paddingHorizontal: 12 },
  rowCopy: { flex: 1 },
  roleTitle: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  fit: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10 },
  outlineButton: { alignItems: 'center', alignSelf: 'stretch', borderColor: lightJourney.blue, borderRadius: 9, borderWidth: 1, height: 44, justifyContent: 'center', marginTop: 10 },
  outlineText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  history: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, minHeight: 66, paddingHorizontal: 12 },
  pageTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 25, lineHeight: 32, marginTop: 10 },
  pageSubtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 4 },
  row: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 68, paddingHorizontal: 12 },
  rowTitle: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  rowDetail: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 15, marginTop: 2 },
  rowValue: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 10, textAlign: 'right' },
  successText: { color: lightJourney.green },
  dangerText: { color: lightJourney.error },
  privateCard: { alignItems: 'center', backgroundColor: lightJourney.surfaceMuted, borderRadius: 10, flexDirection: 'row', gap: 12, marginTop: 22, padding: 16 },
  learn: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 10, marginTop: 7 },
  notifications: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 22, marginTop: 22 },
  toggleRow: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 66, paddingHorizontal: 12 },
  toggle: { backgroundColor: lightJourney.border, borderRadius: 16, height: 32, justifyContent: 'center', paddingHorizontal: 3, width: 52 },
  toggleOn: { backgroundColor: lightJourney.blue },
  toggleKnob: { backgroundColor: '#FFFFFF', borderRadius: 13, height: 26, width: 26 },
  toggleKnobOn: { alignSelf: 'flex-end' },
});
