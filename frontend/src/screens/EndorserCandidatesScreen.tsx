import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { referralsApi } from '../services/api';
import { lightJourney } from '../theme/lightJourney';
import {
  presentEndorserCandidate,
  type EndorserCandidatePresentation,
} from './endorserCandidates/endorserCandidatePresentation';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; candidates: EndorserCandidatePresentation[] }
  | { status: 'error'; message: string };

function useCandidates(): [LoadState, () => void] {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    referralsApi.getInbox().then((items) => {
      if (active) setState({ status: 'ready', candidates: items.map(presentEndorserCandidate) });
    }).catch((error: unknown) => {
      if (!active) return;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not load candidates.' });
    });
    return () => { active = false; };
  }, [attempt]);
  return [state, () => setAttempt((value) => value + 1)];
}

function CandidateRow({ candidate }: { candidate: EndorserCandidatePresentation }): ReactElement {
  const initials = candidate.name.split(' ').map((word) => word[0]).join('').slice(0, 2);
  return <Pressable accessibilityLabel={`${candidate.name} referral`} accessibilityRole="button" onPress={() => router.push(`/endorser/candidates/${candidate.id}` as never)} style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.copy}><Text style={styles.name}>{candidate.name}</Text><Text style={styles.role}>{candidate.role} · {candidate.company}</Text><Text style={styles.score}>{candidate.score}</Text></View><View style={styles.stage}><Text style={styles.stageText}>{candidate.stage}</Text><Ionicons color={lightJourney.textMuted} name="chevron-forward" size={17}/></View></Pressable>;
}

function Feedback({ title, copy, retry }: { title: string; copy: string; retry?: () => void }): ReactElement {
  return <View style={styles.feedback}>{retry ? null : <ActivityIndicator color={lightJourney.blue} size="large"/>}<Text accessibilityRole="header" style={styles.feedbackTitle}>{title}</Text><Text style={styles.subtitle}>{copy}</Text>{retry ? <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}</View>;
}

export function EndorserCandidatesScreen(): ReactElement {
  const [load, retry] = useCandidates();
  const renderItem = useCallback(({ item }: { item: EndorserCandidatePresentation }) => <CandidateRow candidate={item}/>, []);
  if (load.status === 'loading') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Feedback copy="Loading your active referrals." title="Opening candidates"/></SafeAreaView>;
  if (load.status === 'error') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Feedback copy={load.message} retry={retry} title="Candidates unavailable"/></SafeAreaView>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><View style={styles.header}><View style={styles.headerIcon}/><Text style={styles.wordmark}>Endorsly</Text><View style={styles.headerIcon}><Ionicons color={lightJourney.ink} name="people-outline" size={21}/></View></View><FlatList contentContainerStyle={styles.list} data={load.candidates} keyExtractor={(item) => item.id} ListEmptyComponent={<Feedback copy="Accepted and submitted referrals will appear here." title="No active candidates"/>} ListHeaderComponent={<><Text accessibilityRole="header" style={styles.title}>Candidates</Text><Text style={styles.subtitle}>Track everyone you are helping.</Text></>} renderItem={renderItem} showsVerticalScrollIndicator={false}/></SafeAreaView>;
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
  avatar: { alignItems: 'center', backgroundColor: lightJourney.blueSoft, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  avatarText: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  copy: { flex: 1 },
  name: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  role: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  score: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 9, marginTop: 5 },
  stage: { alignItems: 'flex-end', gap: 4 },
  stageText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 9 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  feedbackTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 15, textAlign: 'center' },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
