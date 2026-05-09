import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../components/common/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { SwipeDeck, type SwipeDeckHandle, type SwipeDirection } from '../components/discover/SwipeDeck';
import { SeekerCard as SeekerCardView } from '../components/discover/SeekerCard';
import { ExpandedSeekerCard } from '../components/discover/ExpandedSeekerCard';
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
 * Right swipe = "I'd endorse this person" (mutual match opens chat).
 * Left swipe  = pass.
 */
export function EndorserDiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildSeekerCards('2'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<SeekerCard | null>(null);
  // Trigger token: bumping this fires the celebration once. Null = idle.
  const [celebrationTrigger, setCelebrationTrigger] = useState<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const remaining = Math.max(0, cards.length - index);

  const deckRef = useRef<SwipeDeckHandle>(null);

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
    Phrase.tap();
    setQueueKey((k) => k + 1);
    setIndex(0);
    setLastAction(null);
  }, []);

  const handleCardTap = useCallback((card: SeekerCard) => {
    setExpandedCard(card);
  }, []);

  const handleExpandedCommit = useCallback(
    (direction: SwipeDirection) => {
      if (expandedCard) commitSwipe(expandedCard, direction);
      setExpandedCard(null);
    },
    [expandedCard, commitSwipe],
  );

  const handleUndo = useCallback(() => {
    Phrase.tap();
    setIndex((i) => Math.max(0, i - 1));
    setLastAction(null);
    setCelebrationTrigger(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* Constellation reveals only when the candidate queue is exhausted. */}
      <ConstellationBackdrop visible={remaining === 0} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Endorsly</Text>
          <View style={styles.headerIcons}>
            <PressableScale style={styles.iconBtn}>
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </PressableScale>
            <PressableScale style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </PressableScale>
          </View>
        </View>

        <View style={styles.deckFrame}>
          <SwipeDeck<SeekerCard>
            ref={deckRef}
            items={cards}
            index={index}
            keyOf={(c) => c.id}
            onSwipe={commitSwipe}
            onCardTap={handleCardTap}
            onRefresh={handleRefresh}
            onUndo={handleUndo}
            onCanUndoChange={setCanUndo}
            emptyTitle="Inbox empty"
            emptyBody="No more candidates in your queue. New career stories appear daily."
            renderCard={({
              item,
              isTop,
              stackIndex,
              headProgress,
              entryFrom,
              onSwiped,
              onTap,
              registerSwipe,
            }) => (
              <SeekerCardView
                card={item}
                isTop={isTop}
                stackIndex={stackIndex}
                headProgress={headProgress}
                entryFrom={entryFrom}
                swipesRemaining={cards.length - (index + stackIndex)}
                canUndo={canUndo}
                onUndo={() => deckRef.current?.undo()}
                onSwiped={onSwiped}
                onTap={onTap}
                registerSwipe={registerSwipe}
              />
            )}
          />

          {/* Undo lives on the top card itself — see clip-on cluster. */}
        </View>

        {lastAction && (
          <Animated.View
            style={styles.toastWrap}
            pointerEvents="none"
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
          >
            <View style={styles.toast}>
              <Text style={styles.toastText} numberOfLines={2}>
                {lastAction}
              </Text>
            </View>
          </Animated.View>
        )}

      </SafeAreaView>

      {/* Card-to-full-screen container transform when a card is tapped */}
      <ExpandedSeekerCard
        card={expandedCard}
        onClose={() => setExpandedCard(null)}
        onPass={() => handleExpandedCommit('pass')}
        onCommit={() => handleExpandedCommit('request')}
      />

      {/* Full-screen overlay celebration — sits above the safe area + tab bar.
          Endorser-side swipe = accept, so the seal reads ACCEPTED (not the
          seeker-side default of REQUESTED). */}
      <MatchCelebration trigger={celebrationTrigger} label="ACCEPTED" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
    // Match the seeker DiscoverScreen vertical rhythm: header(60) + filter
    // row(54+4) + spacing[2]. Endorser has no filter row, so push the deck
    // down by the equivalent so the two tabs feel like the same screen.
    marginTop: 58 + spacing[2],
    paddingBottom: 116,
  },
  toastWrap: {
    position: 'absolute',
    bottom: 200,
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
