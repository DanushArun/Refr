import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recommendationsApi } from '../services/api/recommendations';
import { referralsApi } from '../services/api/referrals';
import { SwipeDeck } from '../features/discovery/SwipeDeck';
import { persistSavedCard } from '../features/discovery/savedCards';
import { lightJourney } from '../theme/lightJourney';
import type { EndorserDiscoverState } from './endorserDiscover/endorserDiscoverModel';
import {
  presentEndorserCandidate,
  type EndorserCandidatePresentation,
} from './endorserDiscover/endorserDiscoverPresentation';

type CandidateLoad =
  | { status: 'loading' }
  | { status: 'ready'; candidates: EndorserCandidatePresentation[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

function useCandidates(): [CandidateLoad, () => void] {
  const [load, setLoad] = useState<CandidateLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    recommendationsApi.getSeekers({ limit: 20 })
      .then((items) => {
        if (!isCurrent) return;
        const candidates = items.map(presentEndorserCandidate);
        setLoad(candidates.length ? { status: 'ready', candidates } : { status: 'empty' });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        const message = error instanceof Error ? error.message : 'Could not load candidates.';
        setLoad({ status: 'error', message });
      });
    return () => { isCurrent = false; };
  }, [attempt]);

  return [load, () => setAttempt((value) => value + 1)];
}

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon} />
      <Text style={styles.wordmark}>Endorsly</Text>
      <Pressable accessibilityLabel="Saved candidates" accessibilityRole="button" onPress={() => router.push('/referrer/saved' as never)} style={styles.headerIcon}>
        <Ionicons color={lightJourney.ink} name="bookmark-outline" size={21} />
      </Pressable>
    </View>
  );
}

function Primary({ label, onPress }: { label: string; onPress: () => void }): ReactElement {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.primary}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function CandidateCard({ candidate }: { candidate: EndorserCandidatePresentation }): ReactElement {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>NEW CANDIDATE</Text>
      <Image source={require('../../assets/seeker-entry-portrait.png')} style={styles.avatar} />
      <Text style={styles.name}>{candidate.name}</Text>
      <Text style={styles.role}>{candidate.headline}</Text>
      <Text style={styles.meta}>{candidate.meta}</Text>
      <View style={styles.fit}><Text style={styles.fitText}>{candidate.score}% · {candidate.fitLabel}</Text></View>
      <Text style={styles.target}>{candidate.target}</Text>
    </View>
  );
}

function Tutorial(): ReactElement {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>Discover people you can genuinely help</Text>
      <Text style={styles.subtitle}>Review candidate context before choosing how to help.</Text>
      <View style={styles.stack}>
        <View style={styles.backCard} />
        <View style={styles.backCardTwo} />
        <View style={styles.card} />
      </View>
      <View style={styles.actions}>
        <Text style={styles.pass}>←{`\n`}Pass</Text>
        <Text style={styles.save}>↑{`\n`}Save</Text>
        <Text style={styles.connect}>→{`\n`}Connect</Text>
      </View>
      <Primary label="Got it" onPress={() => router.replace('/endorser/discover' as never)} />
    </View>
  );
}

function Candidate({
  candidate,
  onPass,
  onRequest,
  onSave,
}: {
  candidate: EndorserCandidatePresentation;
  onPass: () => void;
  onRequest: () => void;
  onSave: () => void;
}): ReactElement {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>Candidates for you</Text>
      <Text style={styles.subtitle}>Choose a thoughtful next step for each person.</Text>
      <View style={styles.deck}>
        <View style={styles.backCard} />
        <View style={styles.backCardTwo} />
        <SwipeDeck key={candidate.id} onAction={(action) => {
          if (action === 'pass') onPass();
          if (action === 'save') onSave();
          if (action === 'request') onRequest();
        }}>
          <CandidateCard candidate={candidate} />
        </SwipeDeck>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`Pass ${candidate.name}`}
          accessibilityRole="button"
          onPress={onPass}
          style={styles.round}
        >
          <Ionicons color={lightJourney.orange} name="close" size={24} />
        </Pressable>
        <Pressable accessibilityLabel={`Save ${candidate.name}`} accessibilityRole="button" onPress={onSave} style={styles.round}>
          <Ionicons color={lightJourney.green} name="bookmark-outline" size={22} />
        </Pressable>
        <Pressable
          accessibilityLabel={`Endorse ${candidate.name}`}
          accessibilityRole="button"
          onPress={onRequest}
          style={styles.round}
        >
          <Ionicons color={lightJourney.green} name="arrow-forward" size={22} />
        </Pressable>
      </View>
    </View>
  );
}

function Fit({ candidate }: { candidate: EndorserCandidatePresentation }): ReactElement {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>Why {candidate.name.split(' ')[0]} is a strong fit</Text>
      <Text style={styles.subtitle}>The visible proof behind this recommendation.</Text>
      <View style={styles.fitPanel}>
        {candidate.reasons.map((reason) => (
          <View key={reason} style={styles.fitRow}>
            <Ionicons color={lightJourney.green} name="checkmark-circle" size={20} />
            <Text style={styles.detail}>{reason}</Text>
          </View>
        ))}
      </View>
      <Primary label={`View ${candidate.name}'s profile`} onPress={() => router.push(`/candidate/${candidate.id}` as never)} />
    </View>
  );
}

function Message({ title, copy, onRetry }: { title: string; copy: string; onRetry?: () => void }): ReactElement {
  return (
    <View style={styles.message}>
      {onRetry ? null : <ActivityIndicator color={lightJourney.blue} size="large" />}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{copy}</Text>
      {onRetry ? <Primary label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

function Content({
  state,
  load,
  retry,
  onPass,
  onSave,
  onRequest,
}: {
  state: EndorserDiscoverState;
  load: CandidateLoad;
  retry: () => void;
  onPass: () => void;
  onSave: () => void;
  onRequest: () => void;
}): ReactElement {
  if (state === 'tutorial') return <Tutorial />;
  if (state === 'passed') return <Message title="Passed for now" copy="This person will not be notified. You can review more candidates any time." onRetry={() => router.replace('/endorser/discover' as never)} />;
  if (load.status === 'loading') return <Message title="Finding candidates" copy="Reviewing current opportunities for you." />;
  if (load.status === 'error') return <Message title="Candidates are unavailable" copy={load.message} onRetry={retry} />;
  if (load.status === 'empty') return <Message title="No candidates right now" copy="Check back soon as new people join the network." onRetry={retry} />;
  const candidate = load.candidates[0];
  if (!candidate) return <Message title="No more candidates" copy="You have reviewed everyone currently available." onRetry={retry} />;
  return state === 'fit'
    ? <Fit candidate={candidate} />
    : <Candidate candidate={candidate} onPass={onPass} onRequest={onRequest} onSave={onSave} />;
}

export function EndorserDiscoverScreen({ state }: { state: EndorserDiscoverState }): ReactElement {
  const [load, retry] = useCandidates();
  const [cursor, setCursor] = useState(0);
  const candidate = load.status === 'ready' ? load.candidates[cursor] : undefined;

  const moveNext = useCallback(() => {
    setCursor((current) => current + 1);
  }, []);

  const saveCurrent = useCallback(() => {
    if (!candidate) return;
    void persistSavedCard('endorser', {
      id: candidate.id,
      title: candidate.name,
      subtitle: candidate.headline,
      detail: `${candidate.score}% · ${candidate.fitLabel}`,
      path: `/candidate/${candidate.id}`,
    }).then(moveNext).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Your saved list could not be updated.';
      Alert.alert('Could not save candidate', message);
    });
  }, [candidate, moveNext]);

  const endorseCurrent = useCallback(() => {
    if (!candidate) return;
    moveNext();
    void referralsApi.recordEndorserSwipe({
      id: candidate.id,
      name: candidate.name,
      headline: candidate.headline,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills,
      targetRole: candidate.targetRole,
      opportunityId: candidate.opportunityId,
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'The endorsement could not be sent.';
      Alert.alert('Could not endorse candidate', message);
    });
  }, [candidate, moveNext]);

  const selectedLoad = load.status === 'ready'
    ? { status: 'ready' as const, candidates: load.candidates.slice(cursor) }
    : load;

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header /><Content load={selectedLoad} onPass={moveNext} onRequest={endorseCurrent} onSave={saveCurrent} retry={retry} state={state} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerIcon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  center: { alignItems: 'center', flex: 1, padding: 20, paddingTop: 31 },
  message: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 26 },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27, lineHeight: 33, textAlign: 'center' },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 6, textAlign: 'center' },
  stack: { height: 334, justifyContent: 'center', marginTop: 18, width: '100%' },
  deck: { height: 294, justifyContent: 'center', marginTop: 18, width: '100%' },
  backCard: { backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 16, borderWidth: 1, height: 286, position: 'absolute', right: 19, transform: [{ rotate: '7deg' }], width: '88%' },
  backCardTwo: { backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 16, borderWidth: 1, height: 286, left: 19, position: 'absolute', transform: [{ rotate: '-6deg' }], width: '88%' },
  card: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 16, borderWidth: 1, height: 294, justifyContent: 'center', padding: 20, width: '100%' },
  cardLabel: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 9 },
  avatar: { borderRadius: 38, height: 76, marginTop: 9, width: 76 },
  name: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 25, marginTop: 8 },
  role: { color: lightJourney.text, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 3, textAlign: 'center' },
  meta: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 5, textAlign: 'center' },
  fit: { backgroundColor: lightJourney.greenSoft, borderRadius: 7, marginTop: 10, paddingHorizontal: 9, paddingVertical: 5 },
  fitText: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10 },
  target: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 10, textAlign: 'center' },
  actions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, width: '100%' },
  pass: { color: lightJourney.orange, fontFamily: 'TikTokSans-Medium', fontSize: 12, lineHeight: 20, textAlign: 'center' },
  save: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 12, lineHeight: 20, textAlign: 'center' },
  connect: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 12, lineHeight: 20, textAlign: 'center' },
  round: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 25, borderWidth: 1, height: 50, justifyContent: 'center', width: 50 },
  primary: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 14, height: 52, justifyContent: 'center', marginTop: 24, width: '100%' },
  primaryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 15 },
  fitPanel: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 12, borderWidth: 1, marginTop: 20, width: '100%' },
  fitRow: { alignItems: 'flex-start', borderBottomColor: lightJourney.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 68, padding: 13 },
  detail: { color: lightJourney.textMuted, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 16 },
});
