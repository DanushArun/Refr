import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { EndorserCard, type SwipeDirection } from './EndorserCard';
import type { EndorserCard as EndorserCardData } from './endorserCardData';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface SwipeDeckProps {
  cards: EndorserCardData[];
  /** Fires when the top card leaves the screen. Receives card + direction. */
  onSwipe: (card: EndorserCardData, direction: SwipeDirection) => void;
  /** Optional reset action shown on empty state. */
  onRefresh?: () => void;
}

/**
 * Manages the card stack. Renders only the top 3 cards for perf.
 * Increments index on each completed swipe, triggers onSwipe callback.
 * Shows an empty state when the queue is exhausted.
 */
export function SwipeDeck({ cards, onSwipe, onRefresh }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);

  const handleSwiped = useCallback(
    (direction: SwipeDirection) => {
      const card = cards[index];
      if (card) onSwipe(card, direction);
      setIndex((i) => i + 1);
    },
    [cards, index, onSwipe],
  );

  const visible = cards.slice(index, index + 3);

  if (visible.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>You're caught up</Text>
        <Text style={styles.emptyBody}>
          No more Endorsers in today's queue. Check back later, or broaden your
          target companies.
        </Text>
        {onRefresh && (
          <Button
            label="Refresh queue"
            onPress={() => {
              setIndex(0);
              onRefresh();
            }}
            variant="secondary"
            size="medium"
            fullWidth={false}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.deck}>
      {/* Render in reverse so the top card is last = on top */}
      {visible
        .map((card, i) => ({ card, stackIndex: i }))
        .reverse()
        .map(({ card, stackIndex }) => (
          <EndorserCard
            key={`${card.id}-${index + stackIndex}`}
            card={card}
            isTop={stackIndex === 0}
            stackIndex={stackIndex}
            onSwiped={handleSwiped}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, position: 'relative' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    fontFamily: 'InstrumentSerif-Regular',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
