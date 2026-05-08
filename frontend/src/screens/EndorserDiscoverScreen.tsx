import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeDeck, type SwipeDirection } from '../components/discover/SwipeDeck';
import { SeekerCard as SeekerCardView } from '../components/discover/SeekerCard';
import { SeekerProfileSheet } from '../components/discover/ProfileSheet';
import { ConstellationBackdrop } from '../components/constellation/ConstellationBackdrop';
import { MatchCelebration } from '../components/discover/MatchCelebration';
import {
  buildSeekerCards,
  type SeekerCard,
} from '../components/discover/seekerCardData';
import { Phrase } from '../utils/haptics';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';

/**
 * Endorser Discover — referrer's swipe stack of incoming candidates.
 *
 * Mirror of the seeker's DiscoverScreen: ConstellationBackdrop alive in the
 * background, "Endorsly" serif wordmark, swipe deck of cream credit-cards,
 * floating tab bar clearance.
 *
 * Right swipe = "I'd endorse this person" (mutual match opens chat).
 * Left swipe  = pass.
 */
export function EndorserDiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildSeekerCards('2'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<SeekerCard | null>(null);
  // Trigger token: bumping this fires the celebration once. Null = idle.
  const [celebrationTrigger, setCelebrationTrigger] = useState<number | null>(null);

  const remaining = Math.max(0, cards.length - index);

  const commitSwipe = useCallback(
    (card: SeekerCard, direction: SwipeDirection) => {
      if (direction === 'request') {
        // Fire the celebration immediately on commit — the user's emotional
        // payoff for choosing to endorse. Doesn't wait for the API.
        setCelebrationTrigger(Date.now());
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
    Phrase.tap();
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
    <View style={styles.container}>
      <ConstellationBackdrop visible={remaining === 0} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Endorsly</Text>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
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
            emptyBody="No more candidates in your queue. New career stories appear daily."
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
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingText}>{remaining} remaining swipes</Text>
          </View>
        </View>

        {lastAction && (
          <View style={styles.toastWrap} pointerEvents="none">
            <View style={styles.toast}>
              <Text style={styles.toastText} numberOfLines={2}>
                {lastAction}
              </Text>
            </View>
          </View>
        )}

        <SeekerProfileSheet
          visible={previewCard !== null}
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onPass={() => handlePreviewCommit('pass')}
          onCommit={() => handlePreviewCommit('request')}
        />
      </SafeAreaView>

      {/* Full-screen overlay celebration — sits above the safe area + tab bar */}
      <MatchCelebration trigger={celebrationTrigger} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  wordmark: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 26,
    color: colors.text,
    letterSpacing: 0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.20)',
  },
  deckFrame: {
    flex: 1,
    marginTop: spacing[2],
    paddingBottom: 116,
  },
  remainingBadge: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 31, 68, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.25)',
  },
  remainingText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastWrap: {
    position: 'absolute',
    bottom: 158,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(245, 241, 232, 0.94)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.45)',
    maxWidth: 320,
  },
  toastText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#000000',
    textAlign: 'center',
  },
});
