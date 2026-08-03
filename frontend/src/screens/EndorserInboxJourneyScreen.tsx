import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { referralsApi } from '../services/api';
import { lightJourney } from '../theme/lightJourney';
import {
  presentEndorserInboxItem,
  type EndorserInboxPresentation,
} from './endorserInbox/endorserInboxPresentation';

type InboxLoad =
  | { status: 'loading' }
  | { status: 'ready'; items: EndorserInboxPresentation[] }
  | { status: 'error'; message: string };

function useInbox(): [InboxLoad, () => void] {
  const [load, setLoad] = useState<InboxLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    referralsApi.getInbox()
      .then((items) => {
        if (isCurrent) setLoad({ status: 'ready', items: items.map(presentEndorserInboxItem) });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        const message = error instanceof Error ? error.message : 'Could not load your inbox.';
        setLoad({ status: 'error', message });
      });
    return () => { isCurrent = false; };
  }, [attempt]);

  return [load, () => setAttempt((value) => value + 1)];
}

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <View style={styles.headerButton}><Ionicons color={lightJourney.ink} name="menu-outline" size={23} /></View>
      <Text style={styles.wordmark}>Endorsly</Text>
      <View style={styles.headerButton}><Ionicons color={lightJourney.ink} name="create-outline" size={22} /></View>
    </View>
  );
}

function Avatar({ name }: { name: string }): ReactElement {
  const initials = name.split(' ').map((word) => word[0]).join('').slice(0, 2);
  return <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>;
}

function ConnectionRow({ item }: { item: EndorserInboxPresentation }): ReactElement {
  return (
    <Pressable
      accessibilityLabel={`${item.name} referral`}
      accessibilityRole="button"
      onPress={() => router.push(`/candidate/${item.seekerId}` as never)}
      style={styles.row}
    >
      <Avatar name={item.name} />
      <View style={styles.copy}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.headline}</Text>
        <Text style={styles.fit}>{item.fit}</Text>
      </View>
      <Text style={styles.status}>{item.status}</Text>
      <Ionicons color={lightJourney.textMuted} name="chevron-forward" size={17} />
    </Pressable>
  );
}

function ConversationRow({ item }: { item: EndorserInboxPresentation }): ReactElement {
  return (
    <Pressable
      accessibilityLabel={`Conversation with ${item.name}`}
      accessibilityRole="button"
      onPress={() => router.push(`/chat?referralId=${item.id}` as never)}
      style={styles.row}
    >
      <Avatar name={item.name} />
      <View style={styles.copy}>
        <Text style={styles.name}>{item.name}</Text>
        <Text numberOfLines={2} style={styles.role}>{item.preview}</Text>
      </View>
      <Text style={styles.timeText}>{item.status}</Text>
    </Pressable>
  );
}

function Feedback({ title, copy, retry }: { title: string; copy: string; retry?: () => void }): ReactElement {
  return (
    <View style={styles.feedback}>
      {retry ? null : <ActivityIndicator color={lightJourney.blue} size="large" />}
      <Text accessibilityRole="header" style={styles.feedbackTitle}>{title}</Text>
      <Text style={styles.subtitle}>{copy}</Text>
      {retry ? (
        <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function InboxContent({ items }: { items: EndorserInboxPresentation[] }): ReactElement {
  const active = items.filter((item) => item.status !== 'Requested');
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text accessibilityRole="header" style={styles.title}>Inbox</Text>
      <Text style={styles.subtitle}>Your conversations and connections.</Text>
      {active.length ? (
        <>
          <Text style={styles.section}>Active connections</Text>
          <View style={styles.card}>{active.map((item) => <ConnectionRow item={item} key={item.id} />)}</View>
        </>
      ) : null}
      <Text style={styles.section}>Referral conversations</Text>
      {items.length ? <View style={styles.card}>{items.map((item) => <ConversationRow item={item} key={item.id} />)}</View> : <Text style={styles.empty}>New referral conversations will appear here.</Text>}
    </ScrollView>
  );
}

export function EndorserInboxJourneyScreen(): ReactElement {
  const [load, retry] = useInbox();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Header />
      {load.status === 'loading' ? <Feedback copy="Loading your referral conversations." title="Opening inbox" /> : null}
      {load.status === 'error' ? <Feedback copy={load.message} retry={retry} title="Inbox unavailable" /> : null}
      {load.status === 'ready' ? <InboxContent items={load.items} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { padding: 20, paddingBottom: 30 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  feedbackTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 15, textAlign: 'center' },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 28, lineHeight: 34, marginTop: 8 },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 4, textAlign: 'center' },
  section: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginTop: 20 },
  card: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 75, paddingHorizontal: 11 },
  avatar: { alignItems: 'center', backgroundColor: lightJourney.blueSoft, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  avatarText: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  copy: { flex: 1 },
  name: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  role: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 15, marginTop: 3 },
  fit: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 9, marginTop: 4 },
  status: { backgroundColor: lightJourney.greenSoft, borderRadius: 6, color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 9, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 4 },
  timeText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 9 },
  empty: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 9 },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
