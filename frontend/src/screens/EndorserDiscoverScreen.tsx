import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SwipeDeck,
  type SwipeDeckHandle,
  type SwipeDirection,
} from '../components/discover/SwipeDeck';
import { SeekerCard as SeekerCardView } from '../components/discover/SeekerCard';
import { ExpandedSeekerCard } from '../components/discover/ExpandedSeekerCard';
import { ConstellationBackdrop } from '../components/constellation/ConstellationBackdrop';
import { MatchCelebration } from '../components/discover/MatchCelebration';
import {
  buildSeekerCards,
  type SeekerCard,
} from '../components/discover/seekerCardData';
import { Phrase } from '../utils/haptics';
import { prefetchImages } from '../utils/prefetchImages';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { layout, rhythm, spacing } from '../theme/spacing';
import { DotMatrixBackground } from '../components/common/DotMatrixBackground';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';

/**
 * Endorser Discover — referrer's swipe stack of incoming candidates.
 *
 * Right swipe = "I'd endorse this person".
 * Left swipe  = pass.
 *
 * Filter strip — bespoke to the endorser's question. Discovery (seeker
 * side) filters by the ENDORSER'S company because the seeker is shopping
 * for a referrer at a specific employer. The endorser's incoming queue is
 * already from their company by definition, so company filtering is
 * meaningless here. The bespoke axis is **experience level** — the
 * endorser's main vouching decision is "is this person at a level I'd
 * stake my reputation on?".
 */
export function EndorserDiscoverScreen(): React.ReactElement {
  const isFocused = useIsFocused();
  const [queueKey, setQueueKey] = useState(0);
  const allCards = useMemo(() => buildSeekerCards('2'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<SeekerCard | null>(null);
  // Trigger token: bumping this fires the celebration once. Null = idle.
  const [celebrationTrigger, setCelebrationTrigger] = useState<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [expFilter, setExpFilter] = useState<ExpFilter>('all');

  // Apply the experience filter to the queue. Resetting `index` to 0
  // whenever the active set changes keeps the top of the deck stable —
  // otherwise switching from "Senior" (5 candidates, index 3) back to
  // "All" would land you mid-queue.
  const cards = useMemo(
    () => filterByExperience(allCards, expFilter),
    [allCards, expFilter],
  );
  useEffect(() => {
    setIndex(0);
  }, [expFilter, queueKey]);

  // Warm the portrait cache for every upcoming candidate so the first paint
  // of each card already has the face — no flash from initials → photo on
  // reveal. Refetched only when the queue itself rotates.
  useEffect(() => {
    prefetchImages(allCards.map((c) => c.photoUrl));
  }, [allCards]);

  // Per-bucket counts for the chip badges — calculated against the full
  // queue so chip totals don't shift around as the user toggles between
  // filters. Stable until the queue itself rebuilds.
  const expCounts = useMemo(() => buildExpCounts(allCards), [allCards]);

  const remaining = Math.max(0, cards.length - index);

  const deckRef = useRef<SwipeDeckHandle>(null);

  const commitSwipe = useCallback(
    (card: SeekerCard, direction: SwipeDirection) => {
      if (direction === 'request') {
        // Fire the celebration immediately on commit — the user's emotional
        // payoff for choosing to endorse. Doesn't wait for the API.
        setCelebrationTrigger(Date.now());
        void referralsApi
          .recordEndorserSwipe({
            id: card.id,
            name: card.name,
            headline: card.headline,
            yearsOfExperience: card.yearsOfExperience,
            skills: card.skills,
            targetRole: card.targetRole,
          })
          .catch(() => {});
      }
      setIndex((i) => i + 1);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    Phrase.tap();
    setQueueKey((k) => k + 1);
    setIndex(0);
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
    setCelebrationTrigger(null);
  }, []);

  const onPickExp = useCallback((next: ExpFilter) => {
    setExpFilter(next);
  }, []);

  const filterOptions = useMemo<readonly FilterOption<ExpFilter>[]>(
    () =>
      EXP_FILTERS.map((opt) => ({
        ...opt,
        count: opt.key === 'all' ? allCards.length : expCounts[opt.key],
      })),
    [expCounts, allCards.length],
  );

  return (
    <View style={styles.container}>
      {/* Constellation reveals only when the candidate queue is exhausted. */}
      <ConstellationBackdrop visible={remaining === 0} active={isFocused} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Endorsly</Text>
        </View>

        {/* Experience-level filter strip — same shared FilterBar used by
            every list surface in the app. */}
        <FilterBar
          options={filterOptions}
          current={expFilter}
          onChange={onPickExp}
          showCounts={false}
          ariaLabel="Candidate experience filter"
        />

        <View style={styles.deckFrame}>
          <SwipeDeck<SeekerCard>
            ref={deckRef}
            // Stable key per filter + queue so the deck state resets cleanly
            // when the filter changes (no half-flown card from the prior
            // selection lingering at the top).
            key={`${queueKey}-${expFilter}`}
            items={cards}
            index={index}
            keyOf={(c) => c.id}
            onSwipe={commitSwipe}
            onCardTap={handleCardTap}
            onRefresh={handleRefresh}
            onUndo={handleUndo}
            onCanUndoChange={setCanUndo}
            emptyTitle={
              expFilter === 'all'
                ? 'Inbox empty'
                : `No ${EXP_LABEL[expFilter].toLowerCase()} candidates`
            }
            emptyBody={
              expFilter === 'all'
                ? 'No more candidates in your queue. New career stories appear daily.'
                : 'Try a different experience level, or refresh to see the full queue.'
            }
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

// ─────────── experience filters ───────────

type ExpFilter = 'all' | 'junior' | 'mid' | 'senior';

const EXP_FILTERS: { key: ExpFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'junior', label: 'Junior' },
  { key: 'mid', label: 'Mid' },
  { key: 'senior', label: 'Senior' },
];

const EXP_LABEL: Record<ExpFilter, string> = {
  all: 'All',
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
};

/** Years-of-experience → bucket. Cutoffs match how endorsers actually
 *  triage requests in practice: <3y junior, 3-7 mid-level, 8+ senior. */
function bucketFor(years: number): Exclude<ExpFilter, 'all'> {
  if (years < 3) return 'junior';
  if (years < 8) return 'mid';
  return 'senior';
}

function filterByExperience(
  cards: SeekerCard[],
  filter: ExpFilter,
): SeekerCard[] {
  if (filter === 'all') return cards;
  return cards.filter((c) => bucketFor(c.yearsOfExperience) === filter);
}

function buildExpCounts(
  cards: SeekerCard[],
): Record<Exclude<ExpFilter, 'all'>, number> {
  const out = { junior: 0, mid: 0, senior: 0 };
  for (const c of cards) out[bucketFor(c.yearsOfExperience)] += 1;
  return out;
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
