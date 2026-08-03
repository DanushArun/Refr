import type { SeekerPipelineItem } from '@refr/shared';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { referralsApi } from '../services/api';
import { lightJourney } from '../theme/lightJourney';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; items: SeekerPipelineItem[] }
  | { status: 'error'; message: string };

function titleCase(value: string): string {
  return value.replace(/(^|_)([a-z])/g, (_, prefix: string, letter: string) => {
    return `${prefix ? ' ' : ''}${letter.toUpperCase()}`;
  });
}

function useActivity(): [LoadState, () => void] {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    referralsApi.getPipeline().then((items) => {
      if (active) setState({ status: 'ready', items });
    }).catch((error: unknown) => {
      if (!active) return;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not load activity.' });
    });
    return () => { active = false; };
  }, [attempt]);
  return [state, () => setAttempt((value) => value + 1)];
}

function PipelineRow({ item }: { item: SeekerPipelineItem }): ReactElement {
  const { referral } = item;
  return <Pressable accessibilityLabel={`${item.companyName} ${referral.targetRole}`} accessibilityRole="button" onPress={() => router.push(`/application/${referral.id}` as never)} style={styles.row}><View style={styles.company}><Text style={styles.companyMark}>{item.companyName[0]}</Text></View><View style={styles.copy}><Text style={styles.role}>{referral.targetRole}</Text><Text style={styles.companyName}>{item.companyName} · {item.referrerName ?? 'Endorser'}</Text><Text style={styles.date}>Requested {new Date(referral.requestedAt).toLocaleDateString()}</Text></View><View style={styles.state}><Text style={styles.status}>{titleCase(referral.status)}</Text><Ionicons color={lightJourney.textMuted} name="chevron-forward" size={17} /></View></Pressable>;
}

function Feedback({ title, copy, retry }: { title: string; copy: string; retry?: () => void }): ReactElement {
  return <View style={styles.feedback}>{retry ? null : <ActivityIndicator color={lightJourney.blue} size="large" />}<Text accessibilityRole="header" style={styles.feedbackTitle}>{title}</Text><Text style={styles.subtitle}>{copy}</Text>{retry ? <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}</View>;
}

export function SeekerActivityScreen(): ReactElement {
  const [load, retry] = useActivity();
  const renderItem = useCallback(({ item }: { item: SeekerPipelineItem }) => <PipelineRow item={item} />, []);
  if (load.status === 'loading') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Feedback copy="Loading your referral activity." title="Opening activity" /></SafeAreaView>;
  if (load.status === 'error') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Feedback copy={load.message} retry={retry} title="Activity unavailable" /></SafeAreaView>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><View style={styles.header}><View style={styles.headerIcon}/><Text style={styles.wordmark}>Endorsly</Text><View style={styles.headerIcon}><Ionicons color={lightJourney.ink} name="pulse-outline" size={21}/></View></View><FlatList contentContainerStyle={styles.list} data={load.items} keyExtractor={(item) => item.referral.id} ListEmptyComponent={<Feedback copy="Your referrals will appear here as you request introductions." title="No activity yet" />} ListHeaderComponent={<><Text accessibilityRole="header" style={styles.title}>Activity</Text><Text style={styles.subtitle}>Follow every opportunity from request to decision.</Text></>} renderItem={renderItem} showsVerticalScrollIndicator={false}/></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerIcon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  list: { flexGrow: 1, padding: 20, paddingBottom: 30 },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 28, lineHeight: 34, marginTop: 8 },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 4 },
  row: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 10, minHeight: 88, paddingHorizontal: 11 },
  company: { alignItems: 'center', backgroundColor: lightJourney.ink, borderRadius: 9, height: 48, justifyContent: 'center', width: 48 },
  companyMark: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 19 },
  copy: { flex: 1 },
  role: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  companyName: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  date: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 9, marginTop: 5 },
  state: { alignItems: 'flex-end', gap: 4 },
  status: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 9 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  feedbackTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 15, textAlign: 'center' },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
