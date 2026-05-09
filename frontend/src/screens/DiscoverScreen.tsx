import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../components/common/PressableScale';
import { officeImageUrlFor } from '../components/activity/companyOffices';
import { prefetchImages } from '../utils/prefetchImages';
import { Ionicons } from '@expo/vector-icons';
import { Phrase } from '../utils/haptics';
import { SwipeDeck, type SwipeDeckHandle } from '../components/discover/SwipeDeck';
import { EndorserCard as EndorserCardView } from '../components/discover/EndorserCard';
import { ExpandedEndorserCard } from '../components/discover/ExpandedEndorserCard';
import { ConstellationBackdrop } from '../components/constellation/ConstellationBackdrop';
import { MatchCelebration } from '../components/discover/MatchCelebration';
import {
  buildEndorserCards,
  type EndorserCard,
} from '../components/discover/endorserCardData';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';

const COMPANIES = ['All', 'Google', 'Flipkart', 'Razorpay', 'Swiggy'];

export function DiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildEndorserCards('1'), [queueKey]);

  // Warm the image cache for ALL upcoming office photos in this queue so the
  // first paint of each card already has its hero image. Without this, every
  // card flashes navy → image on its first reveal. Refetched only when the
  // queue itself rotates (queueKey change).
  useEffect(() => {
    prefetchImages(cards.map((c) => officeImageUrlFor(c.companyName)));
  }, [cards]);
  const [index, setIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  // Tapped card animates from its deck position into a full-screen detail sheet
  const [expandedCard, setExpandedCard] = useState<EndorserCard | null>(null);
  // Token-based trigger so the celebration fires once per right-swipe
  const [celebrationTrigger, setCelebrationTrigger] = useState<number | null>(null);
  // Tracks whether undo is available so we can show/hide the rewind affordance.
  const [canUndo, setCanUndo] = useState(false);

  const remainingSwipes = Math.max(0, cards.length - index);

  // Imperative deck handle — only used for the undo affordance now that
  // tap-to-act buttons are gone (swipe is the only commit path).
  const deckRef = useRef<SwipeDeckHandle>(null);

  /**
   * Fires the moment a swipe commits (start of the 220ms fly-off) — kept tight
   * to the gesture so the celebration burst overlaps with the card's exit
   * instead of landing after it. Records the swipe API call here too; deck
   * advance happens separately when the fly-off completes.
   */
  const handleSwipeCommitStart = useCallback(
    (card: EndorserCard, direction: 'request' | 'pass') => {
      if (direction !== 'request') return;
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
      // Fire the full Skia celebration. Phrase.match() runs from inside it.
      setCelebrationTrigger(Date.now());
    },
    [],
  );

  const commitSwipe = useCallback(
    (_card: EndorserCard, _direction: 'request' | 'pass') => {
      // Deck-pointer advance only — the user-facing reaction (celebration +
      // API call) already fired in handleSwipeCommitStart at gesture commit.
      setIndex((i) => i + 1);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    Phrase.tap();
    setQueueKey((k) => k + 1);
    setIndex(0);
  }, []);

  const handleCardTap = useCallback((card: EndorserCard) => {
    setExpandedCard(card);
  }, []);

  const handleExpandedCommit = useCallback(
    (direction: 'request' | 'pass') => {
      if (expandedCard) {
        // Same two-phase shape as the gesture path: commit-start fires the
        // celebration + API call, then commitSwipe advances the deck.
        handleSwipeCommitStart(expandedCard, direction);
        commitSwipe(expandedCard, direction);
      }
      setExpandedCard(null);
    },
    [expandedCard, commitSwipe, handleSwipeCommitStart],
  );

  /**
   * Undo retreats the deck pointer and lets the SwipeDeck animate the
   * restored card back into view from the side it left from. Also drops the
   * pending celebration token so an undone right-swipe doesn't leave the
   * burst lingering.
   */
  const handleUndo = useCallback(() => {
    Phrase.tap();
    setIndex((i) => Math.max(0, i - 1));
    setCelebrationTrigger(null);
  }, []);

  const handleFilterPress = useCallback((company: string) => {
    Phrase.tick();
    setActiveFilter(company);
  }, []);

  return (
    <View style={styles.container}>
      {/* Constellation reveals only when the deck is exhausted — the
          "you're caught up" reward beat. Hidden during normal swiping so
          the deck holds the user's full attention. */}
      <ConstellationBackdrop visible={remainingSwipes === 0} />

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

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {COMPANIES.map((company) => (
              <PressableScale
                key={company}
                onPress={() => handleFilterPress(company)}
                style={[
                  styles.filterChip,
                  activeFilter === company && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === company && styles.filterTextActive,
                  ]}
                >
                  {company}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>

        <View style={styles.deckFrame}>
          <SwipeDeck<EndorserCard>
            ref={deckRef}
            items={cards}
            index={index}
            keyOf={(c) => c.id}
            onSwipeCommitStart={handleSwipeCommitStart}
            onSwipe={commitSwipe}
            onCardTap={handleCardTap}
            onRefresh={handleRefresh}
            onUndo={handleUndo}
            onCanUndoChange={setCanUndo}
            emptyTitle="You're caught up"
            emptyBody="No more Endorsers in today's queue. Check back later, or broaden your target companies."
            renderCard={({
              item,
              isTop,
              stackIndex,
              headProgress,
              entryFrom,
              onCommitStart,
              onSwiped,
              onTap,
              registerSwipe,
            }) => (
              <EndorserCardView
                card={item}
                isTop={isTop}
                stackIndex={stackIndex}
                headProgress={headProgress}
                entryFrom={entryFrom}
                // Each card owns its own count: the swipes-remaining value
                // for the moment when this card becomes top. Stable per card
                // identity (cards.length minus its absolute queue position).
                swipesRemaining={cards.length - (index + stackIndex)}
                canUndo={canUndo}
                onUndo={() => deckRef.current?.undo()}
                onCommitStart={onCommitStart}
                onSwiped={onSwiped}
                onTap={onTap}
                registerSwipe={registerSwipe}
              />
            )}
          />

          {/* Undo lives on the top card itself — attached to the left of
              the swipes-left pill — so the floating action bar is gone. */}
        </View>

      </SafeAreaView>

      {/* Card-to-full-screen container transform when a card is tapped */}
      <ExpandedEndorserCard
        card={expandedCard}
        onClose={() => setExpandedCard(null)}
        onPass={() => handleExpandedCommit('pass')}
        onCommit={() => handleExpandedCommit('request')}
      />

      {/* Full-screen overlay celebration — fires on right-swipe commit */}
      <MatchCelebration trigger={celebrationTrigger} />
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterContainer: {
    height: 54,
    marginTop: 4,
  },
  filterScroll: {
    paddingHorizontal: layout.screenPaddingH,
    alignItems: 'center',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  filterText: {
    fontFamily: 'Outfit-Medium',
    color: colors.textSecondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: '#000000',
    fontFamily: 'Outfit-Bold',
  },
  deckFrame: {
    flex: 1,
    marginTop: spacing[2],
    // Reserve space below the deck for the action bar + remaining badge +
    // floating tab bar (84pt). Keeps cards from bleeding into the chrome.
    paddingBottom: 116,
  },
});
