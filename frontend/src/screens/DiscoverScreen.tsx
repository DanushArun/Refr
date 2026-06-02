import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { officeImageUrlFor } from '../components/activity/companyOffices';
import { prefetchImages } from '../utils/prefetchImages';
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
import { layout, rhythm, spacing } from '../theme/spacing';
import { DotMatrixBackground } from '../components/common/DotMatrixBackground';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';

type CompanyFilter = 'all' | string;

export function DiscoverScreen(): React.ReactElement {
  const isFocused = useIsFocused();
  const [queueKey, setQueueKey] = useState(0);
  const allCards = useMemo(() => buildEndorserCards('1'), [queueKey]);

  // Warm the image cache for ALL upcoming office photos in the unfiltered
  // queue so the first paint of each card already has its hero image.
  // Refetched only when the queue itself rotates (queueKey change).
  useEffect(() => {
    prefetchImages(allCards.map((c) => officeImageUrlFor(c.companyName)));
  }, [allCards]);

  const [index, setIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<CompanyFilter>('all');

  // Apply the company filter to the queue, and reset index whenever the
  // active set changes so the user always lands at the top of the new list.
  const cards = useMemo(
    () =>
      activeFilter === 'all'
        ? allCards
        : allCards.filter((c) => c.companyName === activeFilter),
    [allCards, activeFilter],
  );
  useEffect(() => {
    setIndex(0);
  }, [activeFilter, queueKey]);

  // Build filter options from companies actually present in the queue, with
  // a per-company count so the user can see at a glance which lanes have
  // candidates. Stable until the underlying queue rebuilds.
  const filterOptions = useMemo<readonly FilterOption<CompanyFilter>[]>(() => {
    const counts = new Map<string, number>();
    for (const c of allCards) {
      counts.set(c.companyName, (counts.get(c.companyName) ?? 0) + 1);
    }
    const companyOpts: FilterOption<CompanyFilter>[] = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ key: name, label: name, count }));
    return [
      { key: 'all', label: 'All', count: allCards.length },
      ...companyOpts,
    ];
  }, [allCards]);
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
      const requestNote =
        `Hi ${card.name.split(' ')[0]}, saw your profile — ` +
        `would love an endorsement for ${card.companyName}.`;
      referralsApi
        .recordSeekerSwipe(
          {
            id: card.id,
            name: card.name,
            companyId: card.companyId,
            companyName: card.companyName,
            jobTitle: card.jobTitle,
          },
          requestNote,
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

  const handleFilterPress = useCallback((company: CompanyFilter) => {
    setActiveFilter(company);
  }, []);

  return (
    <View style={styles.container}>
      {/* Constellation reveals only when the deck is exhausted — the
          "you're caught up" reward beat. Hidden during normal swiping so
          the deck holds the user's full attention. */}
      <ConstellationBackdrop visible={remainingSwipes === 0} active={isFocused} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Endorsly</Text>
        </View>

        <FilterBar
          options={filterOptions}
          current={activeFilter}
          onChange={handleFilterPress}
          showCounts={false}
          ariaLabel="Endorser company filter"
        />

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
            emptyBody={
              "No more Endorsers in today's queue. Check back later, or broaden " +
              'your target companies.'
            }
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
  deckFrame: {
    flex: 1,
    marginTop: spacing[2],
    paddingBottom: rhythm.tabClearance,
  },
});
