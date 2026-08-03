import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { referralsApi, type LeaderboardEntry, type ReputationData } from '../services/api';
import { lightJourney } from '../theme/lightJourney';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; reputation: ReputationData; leaderboard: LeaderboardEntry[] }
  | { status: 'error'; message: string };

function useEarnings(): [LoadState, () => void] {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([referralsApi.getReputation(), referralsApi.getLeaderboard()]).then(([reputation, leaderboard]) => {
      if (active) setState({ status: 'ready', reputation, leaderboard });
    }).catch((error: unknown) => {
      if (!active) return;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not load earnings.' });
    });
    return () => { active = false; };
  }, [attempt]);
  return [state, () => setAttempt((value) => value + 1)];
}

function Header(): ReactElement {
  return <View style={styles.header}><View style={styles.icon}/><Text style={styles.wordmark}>Endorsly</Text><View style={styles.icon}><Ionicons color={lightJourney.ink} name="trophy-outline" size={21}/></View></View>;
}

function ScoreRow({ entry, index }: { entry: LeaderboardEntry; index: number }): ReactElement {
  return <View style={styles.scoreRow}><Text style={styles.rank}>#{index + 1}</Text><View style={styles.scoreCopy}><Text style={styles.name}>{entry.user.displayName}</Text><Text style={styles.company}>{entry.company.name}</Text></View><Text style={styles.points}>{entry.endorsementScore}</Text></View>;
}

function Feedback({ title, copy, retry }: { title: string; copy: string; retry?: () => void }): ReactElement {
  return <View style={styles.feedback}>{retry ? null : <ActivityIndicator color={lightJourney.blue} size="large"/>}<Text accessibilityRole="header" style={styles.feedbackTitle}>{title}</Text><Text style={styles.copy}>{copy}</Text>{retry ? <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}</View>;
}

export function EndorserEarningsScreen(): ReactElement {
  const [load, retry] = useEarnings();
  if (load.status === 'loading') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header/><Feedback copy="Loading your Endorsement Score." title="Opening earnings"/></SafeAreaView>;
  if (load.status === 'error') return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header/><Feedback copy={load.message} retry={retry} title="Earnings unavailable"/></SafeAreaView>;
  const { reputation, leaderboard } = load;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header/><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Text accessibilityRole="header" style={styles.title}>Your earnings</Text><Text style={styles.copy}>Recognition grows through helpful, trusted endorsements.</Text><View style={styles.hero}><Text style={styles.eyebrow}>ENDORSEMENT SCORE</Text><Text style={styles.heroValue}>{reputation.endorsementScore}</Text><Text style={styles.heroCaption}>{reputation.totalReferrals} endorsements · {reputation.successfulHires} confirmed hires</Text></View><View style={styles.statRow}><View style={styles.stat}><Text style={styles.statValue}>{reputation.totalReferrals}</Text><Text style={styles.statLabel}>Endorsements</Text></View><View style={styles.stat}><Text style={styles.statValue}>{reputation.successfulHires}</Text><Text style={styles.statLabel}>Hires</Text></View></View><Text style={styles.section}>Community leaderboard</Text><View style={styles.board}>{leaderboard.slice(0, 8).map((entry, index) => <ScoreRow entry={entry} index={index} key={entry.user.id}/>)}</View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  icon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { padding: 20, paddingBottom: 30 },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 28, lineHeight: 34, marginTop: 8 },
  copy: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 4 },
  hero: { alignItems: 'center', backgroundColor: lightJourney.greenSoft, borderColor: lightJourney.border, borderRadius: 14, borderWidth: 1, marginTop: 20, padding: 20 },
  eyebrow: { color: lightJourney.green, fontFamily: 'TikTokSans-Semibold', fontSize: 9, letterSpacing: 1 },
  heroValue: { color: lightJourney.ink, fontFamily: 'GeistMono-Medium', fontSize: 50, marginTop: 6 },
  heroCaption: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stat: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, flex: 1, padding: 13 },
  statValue: { color: lightJourney.ink, fontFamily: 'GeistMono-Medium', fontSize: 22 },
  statLabel: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  section: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginTop: 22 },
  board: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 11, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  scoreRow: { alignItems: 'center', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 58, paddingHorizontal: 13 },
  rank: { color: lightJourney.green, fontFamily: 'GeistMono-Medium', fontSize: 11, width: 34 },
  scoreCopy: { flex: 1 },
  name: { color: lightJourney.text, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  company: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 9, marginTop: 2 },
  points: { color: lightJourney.ink, fontFamily: 'GeistMono-Medium', fontSize: 14 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  feedbackTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, marginTop: 15, textAlign: 'center' },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
