import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  screenContentFor,
  type LightJourneyRole,
  type LightJourneySurface,
} from '../journeys/lightJourneyModel';
import { lightJourney } from '../theme/lightJourney';

interface LightJourneyScreenProps {
  role: LightJourneyRole;
  surface: LightJourneySurface;
}

function RoleMark({ role }: Pick<LightJourneyScreenProps, 'role'>): React.ReactElement {
  const initials = role === 'seeker' ? 'PN' : 'AM';

  return (
    <View accessibilityLabel="Account profile" style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function ScreenHeader({ role }: Pick<LightJourneyScreenProps, 'role'>): React.ReactElement {
  const label = role === 'seeker' ? 'Seeker account' : 'Endorser account';

  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.wordmark}>Endorsly</Text>
      <RoleMark role={role} />
      <Text style={styles.roleLabel}>{label}</Text>
    </View>
  );
}

function ScoreCard({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.scoreCard}>
      <View style={styles.scoreRing}>
        <Text style={styles.scoreValue}>{value}</Text>
      </View>
      <View style={styles.scoreCopy}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreCaption}>Verified details strengthen every match.</Text>
      </View>
    </View>
  );
}

function DetailList({ items, title }: { items: readonly string[]; title: string }): React.ReactElement {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      <View style={styles.listCard}>
        {items.map((item, index) => (
          <View key={item} style={[styles.listRow, index > 0 && styles.listRowBorder]}>
            <Ionicons color={lightJourney.green} name="checkmark-circle" size={20} />
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Notice({ text }: { text: string }): React.ReactElement {
  return (
    <View accessibilityLiveRegion="polite" style={styles.notice}>
      <Ionicons color={lightJourney.green} name="checkmark-circle" size={20} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

function PrimaryAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}
    >
      <Text style={styles.primaryActionText}>{label}</Text>
      <Ionicons color="#FFFFFF" name="arrow-forward" size={20} />
    </Pressable>
  );
}

export function LightJourneyScreen({
  role,
  surface,
}: LightJourneyScreenProps): React.ReactElement {
  const [actionComplete, setActionComplete] = useState(false);
  const content = screenContentFor(role, surface);

  if (!content) {
    return <View style={styles.fallback} />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader role={role} />
        <Text style={styles.eyebrow}>{content.eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.heading}>{content.heading}</Text>
        <Text style={styles.subheading}>{content.subheading}</Text>
        <ScoreCard label={content.scoreLabel} value={content.scoreValue} />
        <DetailList items={content.listItems} title={content.listTitle} />
        {actionComplete ? <Notice text={`${content.primaryAction} is ready.`} /> : null}
      </ScrollView>
      <View style={styles.actionDock}>
        <PrimaryAction label={content.primaryAction} onPress={() => setActionComplete(true)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lightJourney.background },
  content: { paddingHorizontal: 20, paddingBottom: 132 },
  header: { alignItems: 'center', flexDirection: 'row', height: 64, justifyContent: 'center' },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  roleLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginLeft: 8 },
  avatar: { alignItems: 'center', backgroundColor: lightJourney.blueSoft, borderRadius: 20, height: 36, justifyContent: 'center', marginLeft: 'auto', width: 36 },
  avatarText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Semibold', fontSize: 12 },
  eyebrow: { color: lightJourney.blue, fontFamily: 'TikTokSans-Semibold', fontSize: 11, letterSpacing: 1.1, marginTop: 26 },
  heading: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 34, letterSpacing: -0.7, lineHeight: 39, marginTop: 10 },
  subheading: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 16, lineHeight: 24, marginTop: 12 },
  scoreCard: { alignItems: 'center', backgroundColor: lightJourney.greenSoft, borderColor: '#D5EBD9', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 28, padding: 16 },
  scoreRing: { alignItems: 'center', borderColor: lightJourney.green, borderRadius: 32, borderWidth: 3, height: 64, justifyContent: 'center', width: 64 },
  scoreValue: { color: lightJourney.green, fontFamily: 'TikTokSans-Semibold', fontSize: 17 },
  scoreCopy: { flex: 1, marginLeft: 14 },
  scoreLabel: { color: lightJourney.green, fontFamily: 'TikTokSans-Semibold', fontSize: 13 },
  scoreCaption: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 12, lineHeight: 17, marginTop: 2 },
  section: { marginTop: 28 },
  sectionTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Regular', fontSize: 22, marginBottom: 10 },
  listCard: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  listRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 56, paddingHorizontal: 16 },
  listRowBorder: { borderTopColor: lightJourney.border, borderTopWidth: 1 },
  listText: { color: lightJourney.text, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 14 },
  notice: { alignItems: 'center', backgroundColor: lightJourney.orangeSoft, borderRadius: 14, flexDirection: 'row', gap: 10, marginTop: 20, padding: 14 },
  noticeText: { color: lightJourney.ink, flex: 1, fontFamily: 'TikTokSans-Medium', fontSize: 13 },
  actionDock: { backgroundColor: 'rgba(252,249,244,0.96)', borderTopColor: lightJourney.border, borderTopWidth: 1, bottom: 0, left: 0, padding: 16, position: 'absolute', right: 0 },
  primaryAction: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 16, flexDirection: 'row', height: 56, justifyContent: 'center', gap: 10 },
  primaryActionPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  primaryActionText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  fallback: { backgroundColor: lightJourney.background, flex: 1 },
});
