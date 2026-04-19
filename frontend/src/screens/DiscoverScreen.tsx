import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SwipeDeck } from '../components/discover/SwipeDeck';
import {
  buildEndorserCards,
  type EndorserCard,
} from '../components/discover/endorserCardData';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

/**
 * Seeker Discover — Tinder-style swipe stack of Endorsers.
 * Right swipe records an endorsement request; left swipe is a private pass.
 */
export function DiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildEndorserCards('1'), [queueKey]);
  const [remaining, setRemaining] = useState<number>(cards.length);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSwipe = useCallback(
    (card: EndorserCard, direction: 'request' | 'pass') => {
      setRemaining((r) => Math.max(0, r - 1));
      if (direction === 'request') {
        setLastAction(`Request sent to ${card.name}`);
        // Fire-and-forget: the demo-mode createRequest resolves locally.
        referralsApi
          .createRequest({
            feedCardId: `endorser-${card.id}`,
            targetRole: card.jobTitle,
            seekerNote: `Hi ${card.name.split(' ')[0]}, saw your profile and would love an endorsement for ${card.companyName}.`,
          })
          .catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      } else {
        setLastAction(null);
      }
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    setQueueKey((k) => k + 1);
    setRemaining(cards.length);
    setLastAction(null);
  }, [cards.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>ENDORSLY</Text>
          <Text style={styles.subtitle}>
            Swipe right to request · left to pass
          </Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterLabel}>LEFT</Text>
          <Text style={styles.counterValue}>{remaining}</Text>
        </View>
      </View>

      <View style={styles.deckFrame}>
        <SwipeDeck cards={cards} onSwipe={handleSwipe} onRefresh={handleRefresh} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          {lastAction ?? 'Double opt-in: chat opens only when they swipe right too.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: 3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },
  counter: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    alignItems: 'center',
    gap: 2,
  },
  counterLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  counterValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 18,
    color: colors.text,
  },
  deckFrame: {
    flex: 1,
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  footer: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  footerHint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 320,
  },
});
