import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SwipeDeck } from '../components/discover/SwipeDeck';
import { EndorserCard as EndorserCardView } from '../components/discover/EndorserCard';
import { EndorserProfileSheet } from '../components/discover/ProfileSheet';
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
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<EndorserCard | null>(null);

  const remaining = Math.max(0, cards.length - index);

  const commitSwipe = useCallback(
    (card: EndorserCard, direction: 'request' | 'pass') => {
      if (direction === 'request') {
        setLastAction(`Request sent to ${card.name}`);
        referralsApi
          .recordSeekerSwipe(
            {
              id: card.id,
              name: card.name,
              companyId: card.companyId,
              companyName: card.companyName,
              jobTitle: card.jobTitle,
            },
            `Hi ${card.name.split(' ')[0]}, saw your profile — would love an endorsement for ${card.companyName}.`,
          )
          .catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setLastAction(null);
      }
      setIndex((i) => i + 1);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    setQueueKey((k) => k + 1);
    setIndex(0);
    setLastAction(null);
  }, []);

  const handleCardTap = useCallback((card: EndorserCard) => {
    setPreviewCard(card);
  }, []);

  const handlePreviewCommit = useCallback(
    (direction: 'request' | 'pass') => {
      if (previewCard) commitSwipe(previewCard, direction);
      setPreviewCard(null);
    },
    [previewCard, commitSwipe],
  );

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
        <SwipeDeck<EndorserCard>
          items={cards}
          index={index}
          keyOf={(c) => c.id}
          onSwipe={commitSwipe}
          onCardTap={handleCardTap}
          onRefresh={handleRefresh}
          emptyTitle="You're caught up"
          emptyBody="No more Endorsers in today's queue. Check back later, or broaden your target companies."
          renderCard={({ item, isTop, stackIndex, onSwiped, onTap }) => (
            <EndorserCardView
              card={item}
              isTop={isTop}
              stackIndex={stackIndex}
              onSwiped={onSwiped}
              onTap={onTap}
            />
          )}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          {lastAction ?? 'Double opt-in: chat opens only when they swipe right too.'}
        </Text>
      </View>

      <EndorserProfileSheet
        visible={previewCard !== null}
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        onPass={() => handlePreviewCommit('pass')}
        onCommit={() => handlePreviewCommit('request')}
      />
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
