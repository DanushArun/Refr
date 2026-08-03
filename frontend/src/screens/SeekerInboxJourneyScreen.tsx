import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactElement } from 'react';
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
  presentSeekerInboxItem,
  type SeekerInboxPresentation,
} from './seekerInbox/seekerInboxPresentation';

type InboxLoad =
  | { status: 'loading' }
  | { status: 'ready'; items: SeekerInboxPresentation[] }
  | { status: 'error'; message: string };

function useSeekerInbox(): [InboxLoad, () => void] {
  const [load, setLoad] = useState<InboxLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    referralsApi.getPipeline().then((items) => {
      if (active) setLoad({ status: 'ready', items: items.map(presentSeekerInboxItem) });
    }).catch((error: unknown) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : 'Could not load your conversations.';
      setLoad({ status: 'error', message });
    });
    return () => { active = false; };
  }, [attempt]);

  return [load, () => setAttempt((value) => value + 1)];
}

function Header(): ReactElement {
  return <View style={styles.header}><View style={styles.icon} /><Text style={styles.wordmark}>Endorsly</Text><View style={styles.icon}><Ionicons color={lightJourney.ink} name="create-outline" size={21} /></View></View>;
}

function Avatar({ name }: { name: string }): ReactElement {
  const initials = name.split(' ').map((word) => word[0]).join('').slice(0, 2);
  return <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>;
}

function Conversation({ item }: { item: SeekerInboxPresentation }): ReactElement {
  return <Pressable accessibilityLabel={`Conversation with ${item.name}`} accessibilityRole="button" onPress={() => router.push(`/chat?referralId=${item.id}` as never)} style={styles.row}><Avatar name={item.name} /><View style={styles.copy}><Text style={styles.name}>{item.name}</Text><Text style={styles.role}>{item.role} · {item.company}</Text><Text numberOfLines={1} style={styles.preview}>{item.preview}</Text></View><View style={styles.state}><Text style={styles.status}>{item.status}</Text><Ionicons color={lightJourney.textMuted} name="chevron-forward" size={16} /></View></Pressable>;
}

function Feedback({ title, copy, retry }: { title: string; copy: string; retry?: () => void }): ReactElement {
  return <View style={styles.feedback}>{retry ? null : <ActivityIndicator color={lightJourney.blue} size="large" />}<Text accessibilityRole="header" style={styles.feedbackTitle}>{title}</Text><Text style={styles.subtitle}>{copy}</Text>{retry ? <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}</View>;
}

function Content({ items }: { items: SeekerInboxPresentation[] }): ReactElement {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Text accessibilityRole="header" style={styles.title}>Inbox</Text><Text style={styles.subtitle}>Your conversations with trusted endorsers.</Text><Text style={styles.section}>Referral conversations</Text>{items.length ? <View style={styles.card}>{items.map((item) => <Conversation item={item} key={item.id} />)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No conversations yet</Text><Text style={styles.subtitle}>Request an introduction to begin a conversation.</Text></View>}</ScrollView>;
}

export function SeekerInboxJourneyScreen(): ReactElement {
  const [load, retry] = useSeekerInbox();
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header />{load.status === 'loading' ? <Feedback copy="Loading your referral conversations." title="Opening inbox" /> : null}{load.status === 'error' ? <Feedback copy={load.message} retry={retry} title="Inbox unavailable" /> : null}{load.status === 'ready' ? <Content items={load.items} /> : null}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  icon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { padding: 20, paddingBottom: 30 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  feedbackTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 15, textAlign: 'center' },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 28, lineHeight: 34, marginTop: 8 },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 4 },
  section: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginTop: 20 },
  card: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 80, paddingHorizontal: 11 },
  avatar: { alignItems: 'center', backgroundColor: lightJourney.blueSoft, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  avatarText: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  copy: { flex: 1 },
  name: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  role: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 15, marginTop: 3 },
  preview: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  state: { alignItems: 'flex-end', gap: 3 },
  status: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 9 },
  empty: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, marginTop: 8, padding: 16 },
  emptyTitle: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 13 },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
