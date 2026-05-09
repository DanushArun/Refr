import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
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

  const commitSwipe = useCallback(
    (card: EndorserCard, direction: 'request' | 'pass') => {
      if (direction === 'request') {
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

  const handleCardTap = useCallback((card: EndorserCard) => {
    setExpandedCard(card);
  }, []);

  const handleExpandedCommit = useCallback(
    (direction: 'request' | 'pass') => {
      if (expandedCard) commitSwipe(expandedCard, direction);
      setExpandedCard(null);
    },
    [expandedCard, commitSwipe],
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
              <Pressable
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
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.deckFrame}>
          <SwipeDeck<EndorserCard>
            ref={deckRef}
            items={cards}
            index={index}
            keyOf={(c) => c.id}
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
                onSwiped={onSwiped}
                onTap={onTap}
                registerSwipe={registerSwipe}
              />
            )}
          />

          {/**
            * Undo affordance only — Pass and Endorse are gesture-only so the
            * deck stays clean. Undo fades in when there is history to rewind
            * and disappears otherwise.
            */}
          {remainingSwipes > 0 && canUndo && (
            <Animated.View
              style={styles.actionBar}
              entering={FadeIn.duration(220).easing(Easing.out(Easing.cubic))}
              exiting={FadeOut.duration(160)}
            >
              <Pressable
                onPress={() => deckRef.current?.undo()}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.undoBtn,
                  pressed && styles.actionBtnPressed,
                ]}
                hitSlop={8}
              >
                <Ionicons name="arrow-undo" size={20} color={colors.gold} />
              </Pressable>
            </Animated.View>
          )}

          <View style={styles.remainingBadge}>
            <Text style={styles.remainingText}>{remainingSwipes} remaining swipes</Text>
          </View>
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
  remainingBadge: {
    position: 'absolute',
    bottom: 158,
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
  /* Undo affordance — centered above the floating tab bar, visible only when
     there is a swipe to rewind. */
  actionBar: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 6,
  },
  actionBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  undoBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 31, 68, 0.85)',
    borderColor: colors.goldDim,
  },
});
