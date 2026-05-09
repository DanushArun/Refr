import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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
 *
 * Filter strip — bespoke to the endorser's question. Discovery (seeker
 * side) filters by the ENDORSER'S company because the seeker is shopping
 * for a referrer at a specific employer. The endorser's incoming queue is
 * already from their company by definition, so company filtering is
 * meaningless here. The bespoke axis is **experience level** — the
 * endorser's main vouching decision is "is this person at a level I'd
 * stake my reputation on?".
 */
export function EndorserDiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const allCards = useMemo(() => buildSeekerCards('2'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
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

  const onPickExp = useCallback((next: ExpFilter) => {
    if (next === expFilter) return;
    Phrase.tick();
    setExpFilter(next);
  }, [expFilter]);

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

        {/* Experience-level filter strip — bespoke to the endorser's queue.
            Same chip language as the seeker's Discovery + Matches so the
            three swipe/list surfaces feel like one product. */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {EXP_FILTERS.map((opt) => {
              const active = opt.key === expFilter;
              const count = opt.key === 'all' ? allCards.length : expCounts[opt.key];
              const empty = !active && count === 0 && opt.key !== 'all';
              return (
                <PressableScale
                  key={opt.key}
                  onPress={() => onPickExp(opt.key)}
                  hitSlop={6}
                  style={[
                    styles.filterChip,
                    active && styles.filterChipActive,
                    empty && styles.filterChipEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                      empty && styles.filterTextEmpty,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.filterBadge,
                        active && styles.filterBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          active && styles.filterBadgeTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

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

  /* Filter strip — same chip language as Matches + Discovery, scaled to
     match this screen's denser top bar. */
  filterContainer: {
    height: 50,
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: layout.screenPaddingH,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.30,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  filterChipEmpty: {
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'transparent',
  },
  filterText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  filterTextActive: {
    color: '#0A1F44',
    fontFamily: 'Outfit-Bold',
  },
  filterTextEmpty: {
    color: colors.textTertiary,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(10, 31, 68, 0.20)',
  },
  filterBadgeText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  filterBadgeTextActive: {
    color: '#0A1F44',
  },

  deckFrame: {
    flex: 1,
    // Header(60) + filter(50+4) + breathing room — matches the seeker's
    // Discovery rhythm now that this screen has its own filter strip.
    marginTop: spacing[2],
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
