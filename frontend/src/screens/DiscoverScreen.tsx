import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeDeck } from '../features/discovery/SwipeDeck';
import { persistSavedCard } from '../features/discovery/savedCards';
import { recommendationsApi } from '../services/api/recommendations';
import { referralsApi } from '../services/api/referrals';
import { lightJourney } from '../theme/lightJourney';
import { type SeekerOpportunityPresentation, presentSeekerOpportunity } from './discover/seekerOpportunityPresentation';

type ScreenState = 'tutorial' | 'card' | 'fit';
type OpportunityLoad =
  | { status: 'loading' }
  | { status: 'ready'; opportunities: SeekerOpportunityPresentation[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

function useOpportunities(): [OpportunityLoad, () => void] {
  const [load, setLoad] = useState<OpportunityLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    recommendationsApi.getReferrers({ limit: 20 }).then((items) => {
      if (!active) return;
      const opportunities = items.map(presentSeekerOpportunity);
      setLoad(opportunities.length ? { status: 'ready', opportunities } : { status: 'empty' });
    }).catch((error: unknown) => {
      if (!active) return;
      setLoad({ status: 'error', message: error instanceof Error ? error.message : 'Could not load opportunities.' });
    });
    return () => { active = false; };
  }, [attempt]);

  return [load, () => setAttempt((value) => value + 1)];
}

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <View style={styles.headerButton} />
      <Text style={styles.wordmark}>Endorsly</Text>
      <Pressable accessibilityLabel="Saved opportunities" accessibilityRole="button" onPress={() => router.push('/seeker/saved' as never)} style={styles.headerButton}>
        <Ionicons color={lightJourney.ink} name="bookmark-outline" size={22} />
      </Pressable>
    </View>
  );
}

function OpportunityCard({ opportunity }: { opportunity: SeekerOpportunityPresentation }): ReactElement {
  return (
    <View style={styles.roleCard}>
      <View style={styles.roleImage}>
        <Text style={styles.companyHero}>{opportunity.company}</Text>
        <Text style={styles.matchPill}>Trusted match</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.companyBadge}><Text style={styles.companyMark}>{opportunity.company[0]}</Text></View>
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.company}>{opportunity.company}</Text>
        <Text style={styles.meta}>{opportunity.connection}</Text>
        <View style={styles.fit}><View style={styles.ring}><Text style={styles.ringText}>{opportunity.score}%</Text></View><View><Text style={styles.fitTitle}>{opportunity.fitLabel}</Text><Text style={styles.fitText}>Based on profile and opportunity context</Text></View></View>
        <Text style={styles.why}>Why this is a match</Text>
        {opportunity.reasons.slice(0, 3).map((reason) => <Text key={reason} style={styles.reason}>●  {reason}</Text>)}
      </View>
    </View>
  );
}

function Tutorial({ onDone }: { onDone: () => void }): ReactElement {
  return (
    <View style={styles.tutorial}>
      <Text accessibilityRole="header" style={styles.tutorialTitle}>Discover opportunities</Text>
      <Text style={styles.tutorialText}>Meaningful roles, through trusted{`\n`}employee connections.</Text>
      <View style={styles.tutorialStack}><View style={[styles.paper, styles.paperBack]} /><View style={[styles.paper, styles.paperMid]} /><View style={styles.paper} /></View>
      <View style={styles.tutorialActions}><Text style={styles.pass}>←{`\n`}Swipe left{`\n`}Pass</Text><Text style={styles.save}>↑{`\n`}Swipe up{`\n`}Save</Text><Text style={styles.request}>→{`\n`}Request intro</Text></View>
      <View style={styles.dots}><View style={styles.dotActive} /><View style={styles.dot} /><View style={styles.dot} /></View>
      <Pressable accessibilityLabel="Got it" accessibilityRole="button" onPress={onDone} style={styles.gotIt}><Text style={styles.gotItText}>Got it</Text></Pressable>
    </View>
  );
}

function FitSheet({ opportunity, onClose }: { opportunity: SeekerOpportunityPresentation; onClose: () => void }): ReactElement {
  return (
    <View style={styles.sheetOverlay}>
      <View style={styles.sheet}>
        <Pressable accessibilityLabel="Close fit explanation" accessibilityRole="button" onPress={onClose} style={styles.close}><Ionicons color={lightJourney.ink} name="close" size={21} /></Pressable>
        <Text accessibilityRole="header" style={styles.sheetTitle}>Your fit explained</Text>
        <View style={styles.fit}><View style={styles.ring}><Text style={styles.ringText}>{opportunity.score}%</Text></View><View><Text style={styles.fitTitle}>{opportunity.fitLabel}</Text><Text style={styles.fitText}>This role and your profile are aligned.</Text></View></View>
        <Text style={styles.why}>Strong match</Text>
        {opportunity.reasons.map((reason) => <Text key={reason} style={styles.reason}>●  {reason}</Text>)}
        <View style={styles.info}><Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={19} /><Text style={styles.infoText}>Fit is guidance, not a hiring decision.</Text></View>
      </View>
    </View>
  );
}

function Controls({ opportunity, onPass, onRequest, onSave, onFit }: {
  opportunity: SeekerOpportunityPresentation;
  onPass: () => void;
  onRequest: () => void;
  onSave: () => void;
  onFit: () => void;
}): ReactElement {
  return (
    <View style={styles.controls}>
      <Pressable accessibilityLabel={`Pass ${opportunity.title}`} accessibilityRole="button" onPress={onPass} style={styles.round}><Ionicons color={lightJourney.orange} name="close" size={24} /></Pressable>
      <Pressable accessibilityLabel={`Save ${opportunity.title}`} accessibilityRole="button" onPress={onSave} style={styles.round}><Ionicons color={lightJourney.green} name="bookmark-outline" size={22} /></Pressable>
      <Pressable accessibilityLabel="Explain fit" accessibilityRole="button" onPress={onFit} style={styles.round}><Ionicons color={lightJourney.blue} name="sparkles-outline" size={21} /></Pressable>
      <Pressable accessibilityLabel={`Request introduction to ${opportunity.company}`} accessibilityRole="button" onPress={onRequest} style={styles.round}><Ionicons color={lightJourney.green} name="arrow-forward" size={22} /></Pressable>
    </View>
  );
}

function Message({ title, copy, onRetry }: { title: string; copy: string; onRetry?: () => void }): ReactElement {
  return <View style={styles.message}>{onRetry ? null : <ActivityIndicator color={lightJourney.blue} size="large" />}<Text accessibilityRole="header" style={styles.tutorialTitle}>{title}</Text><Text style={styles.tutorialText}>{copy}</Text>{onRetry ? <Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}</View>;
}

function Deck({ opportunity, onPass, onRequest, onSave, onFit }: {
  opportunity: SeekerOpportunityPresentation;
  onPass: () => void;
  onRequest: () => void;
  onSave: () => void;
  onFit: () => void;
}): ReactElement {
  return (
    <View style={styles.content}>
      <View style={styles.deck}><View style={styles.deckBack} /><View style={styles.deckMid} /><SwipeDeck key={opportunity.id} onAction={(action) => { if (action === 'pass') onPass(); if (action === 'save') onSave(); if (action === 'request') onRequest(); }}><OpportunityCard opportunity={opportunity} /></SwipeDeck></View>
      <Controls onFit={onFit} onPass={onPass} onRequest={onRequest} onSave={onSave} opportunity={opportunity} />
    </View>
  );
}

export function DiscoverScreen(): ReactElement {
  const [screen, setScreen] = useState<ScreenState>('tutorial');
  const [load, retry] = useOpportunities();
  const [cursor, setCursor] = useState(0);
  const opportunity = load.status === 'ready' ? load.opportunities[cursor] : undefined;

  const next = useCallback(() => setCursor((value) => value + 1), []);
  const save = useCallback(() => {
    if (!opportunity) return;
    void persistSavedCard('seeker', { id: opportunity.id, title: opportunity.title, subtitle: opportunity.company, detail: `${opportunity.score}% · ${opportunity.fitLabel}`, path: `/opportunity/${opportunity.id}` }).then(next).catch((error: unknown) => {
      Alert.alert('Could not save opportunity', error instanceof Error ? error.message : 'Your saved list could not be updated.');
    });
  }, [next, opportunity]);

  const request = useCallback(() => {
    if (!opportunity) return;
    next();
    void referralsApi.recordSeekerSwipe({
      id: opportunity.referrerId,
      name: opportunity.connection.split(' · ')[0],
      companyId: opportunity.companyId,
      companyName: opportunity.company,
      jobTitle: opportunity.endorserJobTitle,
      opportunityId: opportunity.id,
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'The introduction request could not be sent.';
      Alert.alert('Could not request an introduction', message);
    });
  }, [next, opportunity]);

  let content: ReactElement;
  if (screen === 'tutorial') content = <Tutorial onDone={() => setScreen('card')} />;
  else if (load.status === 'loading') content = <Message copy="Finding opportunities through trusted employee connections." title="Finding matches" />;
  else if (load.status === 'error') content = <Message copy={load.message} onRetry={retry} title="Opportunities unavailable" />;
  else if (load.status === 'empty' || !opportunity) content = <Message copy="Check back soon as new opportunities are added." onRetry={retry} title="No more matches right now" />;
  else content = <Deck onFit={() => setScreen('fit')} onPass={next} onRequest={request} onSave={save} opportunity={opportunity} />;

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header />{content}{screen === 'fit' && opportunity ? <FitSheet onClose={() => setScreen('card')} opportunity={opportunity} /> : null}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  deck: { height: 470, justifyContent: 'center', width: '100%' },
  deckBack: { backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 13, borderWidth: 1, height: 410, position: 'absolute', right: 15, transform: [{ rotate: '6deg' }], width: '93%' },
  deckMid: { backgroundColor: lightJourney.surfaceMuted, borderColor: lightJourney.border, borderRadius: 13, borderWidth: 1, height: 410, left: 15, position: 'absolute', transform: [{ rotate: '-4deg' }], width: '93%' },
  tutorial: { alignItems: 'center', flex: 1, paddingHorizontal: 28, paddingTop: 30 },
  message: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  tutorialTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 28, textAlign: 'center' },
  tutorialText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' },
  tutorialStack: { height: 270, marginTop: 55, width: 168 },
  paper: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 14, borderWidth: 1, height: 238, padding: 22, position: 'absolute', width: 168 },
  paperBack: { transform: [{ rotate: '-9deg' }] },
  paperMid: { transform: [{ rotate: '-4deg' }] },
  tutorialActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -20, width: '100%' },
  pass: { color: lightJourney.orange, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 16, textAlign: 'center' },
  save: { color: lightJourney.green, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 16, textAlign: 'center' },
  request: { color: lightJourney.green, fontFamily: 'TikTokSans-Regular', fontSize: 10, lineHeight: 16, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 22 },
  dot: { backgroundColor: lightJourney.border, borderRadius: 4, height: 7, width: 7 },
  dotActive: { backgroundColor: lightJourney.blue, borderRadius: 4, height: 7, width: 7 },
  gotIt: { alignItems: 'center', height: 52, justifyContent: 'center', marginTop: 15, width: '100%' },
  gotItText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 15 },
  roleCard: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 13, borderWidth: 1, overflow: 'hidden' },
  roleImage: { backgroundColor: lightJourney.surfaceMuted, height: 128, justifyContent: 'flex-end', padding: 14 },
  companyHero: { color: lightJourney.ink, fontFamily: 'TikTokSans-Semibold', fontSize: 20, textAlign: 'right' },
  matchPill: { alignSelf: 'flex-start', backgroundColor: lightJourney.blueSoft, borderRadius: 10, color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 10, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6, position: 'absolute', top: 12 },
  cardBody: { padding: 14 },
  companyBadge: { alignItems: 'center', backgroundColor: lightJourney.ink, borderRadius: 7, height: 39, justifyContent: 'center', width: 39 },
  companyMark: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 17 },
  title: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 26, marginTop: 8 },
  company: { color: lightJourney.ink, fontFamily: 'TikTokSans-Regular', fontSize: 15, marginTop: 2 },
  meta: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 9 },
  fit: { alignItems: 'center', backgroundColor: lightJourney.greenSoft, borderRadius: 10, flexDirection: 'row', gap: 12, marginTop: 16, padding: 11 },
  ring: { alignItems: 'center', borderColor: lightJourney.green, borderRadius: 26, borderWidth: 3, height: 52, justifyContent: 'center', width: 52 },
  ringText: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 14 },
  fitTitle: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  fitText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 3 },
  why: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 12, marginTop: 15 },
  reason: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 21 },
  controls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginTop: 7, width: '100%' },
  round: { alignItems: 'center', backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 25, borderWidth: 1, height: 50, justifyContent: 'center', width: 50 },
  sheetOverlay: { backgroundColor: 'rgba(16,38,77,0.38)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sheet: { backgroundColor: lightJourney.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, bottom: 0, left: 0, padding: 22, position: 'absolute', right: 0 },
  close: { alignItems: 'center', height: 44, justifyContent: 'center', position: 'absolute', right: 12, top: 8, width: 44 },
  sheetTitle: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 25, textAlign: 'center' },
  info: { alignItems: 'center', backgroundColor: lightJourney.surfaceMuted, borderRadius: 9, flexDirection: 'row', gap: 8, marginTop: 15, padding: 11 },
  infoText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10 },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
