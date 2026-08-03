import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  loadSavedCards,
  removeSavedCard,
  type DiscoveryRole,
  type SavedDiscoveryCard,
} from '../features/discovery/savedCards';
import { lightJourney } from '../theme/lightJourney';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; cards: SavedDiscoveryCard[] }
  | { status: 'error'; message: string };

function useSavedCards(role: DiscoveryRole): [LoadState, () => void, (id: string) => void] {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadSavedCards(role).then((cards) => {
      if (active) setState({ status: 'ready', cards });
    }).catch((error: unknown) => {
      if (!active) return;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Could not load saved cards.' });
    });
    return () => { active = false; };
  }, [attempt, role]);

  const remove = useCallback((id: string) => {
    void removeSavedCard(role, id).then((cards) => {
      setState({ status: 'ready', cards });
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Could not update saved cards.';
      Alert.alert('Could not remove card', message);
    });
  }, [role]);

  return [state, () => setAttempt((value) => value + 1), remove];
}

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons color={lightJourney.ink} name="arrow-back" size={22} />
      </Pressable>
      <Text style={styles.wordmark}>Saved</Text>
      <View style={styles.headerButton} />
    </View>
  );
}

function SavedCard({ card, onRemove }: { card: SavedDiscoveryCard; onRemove: () => void }): ReactElement {
  return (
    <View style={styles.card}>
      <Pressable accessibilityLabel={`Open ${card.title}`} accessibilityRole="button" onPress={() => router.push(card.path as never)} style={styles.cardMain}>
        <View style={styles.bookmark}><Ionicons color={lightJourney.green} name="bookmark" size={18} /></View>
        <View style={styles.copy}><Text style={styles.title}>{card.title}</Text><Text style={styles.subtitle}>{card.subtitle}</Text><Text style={styles.detail}>{card.detail}</Text></View>
        <Ionicons color={lightJourney.textMuted} name="chevron-forward" size={18} />
      </Pressable>
      <Pressable accessibilityLabel={`Remove ${card.title}`} accessibilityRole="button" onPress={onRemove} style={styles.remove}>
        <Text style={styles.removeText}>Remove</Text>
      </Pressable>
    </View>
  );
}

function Content({ state, retry, remove }: {
  state: LoadState;
  retry: () => void;
  remove: (id: string) => void;
}): ReactElement {
  if (state.status === 'loading') return <View style={styles.feedback}><ActivityIndicator color={lightJourney.blue} size="large" /></View>;
  if (state.status === 'error') return <View style={styles.feedback}><Text style={styles.title}>Saved cards unavailable</Text><Text style={styles.subtitle}>{state.message}</Text><Pressable accessibilityLabel="Try again" accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View>;
  if (!state.cards.length) return <View style={styles.feedback}><Ionicons color={lightJourney.green} name="bookmark-outline" size={34} /><Text style={styles.title}>Nothing saved yet</Text><Text style={styles.subtitle}>Swipe a card up to keep it for later.</Text></View>;
  return <ScrollView contentContainerStyle={styles.content}>{state.cards.map((card) => <SavedCard card={card} key={card.id} onRemove={() => remove(card.id)} />)}</ScrollView>;
}

export function SavedCardsScreen({ role }: { role: DiscoveryRole }): ReactElement {
  const [state, retry, remove] = useSavedCards(role);
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><Header /><Content remove={remove} retry={retry} state={state} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', height: 56, justifyContent: 'space-between', paddingHorizontal: 18 },
  headerButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { padding: 20 },
  feedback: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  card: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderRadius: 12, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardMain: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 76, padding: 12 },
  bookmark: { alignItems: 'center', backgroundColor: lightJourney.greenSoft, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  copy: { flex: 1 },
  title: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 13, textAlign: 'center' },
  subtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 17, marginTop: 3, textAlign: 'center' },
  detail: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 10, marginTop: 4 },
  remove: { alignItems: 'center', borderTopColor: lightJourney.border, borderTopWidth: 1, height: 40, justifyContent: 'center' },
  removeText: { color: lightJourney.error, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  retry: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 12, height: 48, justifyContent: 'center', marginTop: 20, width: '100%' },
  retryText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 14 },
});
