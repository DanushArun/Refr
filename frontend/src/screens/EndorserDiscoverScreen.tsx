import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SwipeDeck, type SwipeDirection } from '../components/discover/SwipeDeck';
import { SeekerCard as SeekerCardView } from '../components/discover/SeekerCard';
import { SeekerProfileSheet } from '../components/discover/ProfileSheet';
import {
  buildSeekerCards,
  type SeekerCard,
} from '../components/discover/seekerCardData';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

/**
 * Endorser Discover — swipe stack of Seeker career stories.
 * Swipe right = private "I'd endorse this person" (mutual match opens chat).
 * Swipe left = pass, removed from queue.
 * Designed for batch review during commute / coffee breaks (UX spec § 6).
 */
export function EndorserDiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildSeekerCards('2'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<SeekerCard | null>(null);

  const remaining = Math.max(0, cards.length - index);

  const commitSwipe = useCallback(
    (card: SeekerCard, direction: SwipeDirection) => {
      if (direction === 'request') {
        referralsApi
          .recordEndorserSwipe({
            id: card.id,
            name: card.name,
            headline: card.headline,
            yearsOfExperience: card.yearsOfExperience,
            skills: card.skills,
            targetRole: card.targetRole,
          })
          .then(({ mutual }) => {
            setLastAction(
              mutual
                ? `Mutual match with ${card.name} — chat opened in Active`
                : `${card.name} added to your Active list`,
            );
          })
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

  const handleCardTap = useCallback((card: SeekerCard) => {
    setPreviewCard(card);
  }, []);

  const handlePreviewCommit = useCallback(
    (direction: SwipeDirection) => {
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
            Swipe right to endorse · left to pass
          </Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterLabel}>LEFT</Text>
          <Text style={styles.counterValue}>{remaining}</Text>
        </View>
      </View>

      <View style={styles.deckFrame}>
        <SwipeDeck<SeekerCard>
          items={cards}
          index={index}
          keyOf={(c) => c.id}
          onSwipe={commitSwipe}
          onCardTap={handleCardTap}
          onRefresh={handleRefresh}
          emptyTitle="Inbox empty"
          emptyBody="No more Seekers in your queue. New career stories appear daily."
          renderCard={({ item, isTop, stackIndex, onSwiped, onTap }) => (
            <SeekerCardView
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
          {lastAction ?? 'Double opt-in: chat opens only if they swipe right too.'}
        </Text>
      </View>

      <SeekerProfileSheet
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
