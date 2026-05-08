import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Phrase } from '../utils/haptics';
import { SwipeDeck } from '../components/discover/SwipeDeck';
import { EndorserCard as EndorserCardView } from '../components/discover/EndorserCard';
import { EndorserProfileSheet } from '../components/discover/ProfileSheet';
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
  const [previewCard, setPreviewCard] = useState<EndorserCard | null>(null);

  const remainingSwipes = Math.max(0, cards.length - index);
  // Token-based trigger so the celebration fires once per right-swipe
  const [celebrationTrigger, setCelebrationTrigger] = useState<number | null>(null);

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
    setQueueKey((k) => k + 1);
    setIndex(0);
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
    <View style={styles.container}>
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
                onPress={() => setActiveFilter(company)}
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
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingText}>{remainingSwipes} remaining swipes</Text>
          </View>
        </View>

        <EndorserProfileSheet
          visible={previewCard !== null}
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onPass={() => handlePreviewCommit('pass')}
          onCommit={() => handlePreviewCommit('request')}
        />
      </SafeAreaView>

      {/* Full-screen overlay celebration — fires on right-swipe commit */}
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
    // Reserve space below the deck so cards never bleed under the floating
    // tab bar (tab bar is 70px tall + 26px from bottom = 96px clearance,
    // plus a touch of breathing room).
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
});
