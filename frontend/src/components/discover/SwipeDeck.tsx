import React, { type ReactElement } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

export type SwipeDirection = 'request' | 'pass';

export interface SwipeDeckRenderArgs<T> {
  item: T;
  isTop: boolean;
  stackIndex: number;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
}

interface SwipeDeckProps<T> {
  items: T[];
  /** Current top-of-deck pointer — lifted to parent so modal commits can advance. */
  index: number;
  keyOf: (item: T) => string;
  renderCard: (args: SwipeDeckRenderArgs<T>) => ReactElement;
  /** Called when a gesture commits. Parent should record the action and advance. */
  onSwipe: (item: T, direction: SwipeDirection) => void;
  /** Called when top card is tapped (not dragged). */
  onCardTap?: (item: T) => void;
  /** Called when the deck runs out and user taps refresh. */
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
}

/**
 * Generic swipe deck. Renders top 3 cards for performance.
 * Parent owns the index — letting modal actions / external triggers advance the deck.
 */
export function SwipeDeck<T>({
  items,
  index,
  keyOf,
  renderCard,
  onSwipe,
  onCardTap,
  onRefresh,
  emptyTitle = "You're caught up",
  emptyBody = "No more cards in today's queue.",
}: SwipeDeckProps<T>) {
  const handleSwiped = (direction: SwipeDirection) => {
    const item = items[index];
    if (item) onSwipe(item, direction);
  };

  const handleTap = () => {
    const item = items[index];
    if (item && onCardTap) onCardTap(item);
  };

  const visible = items.slice(index, index + 3);

  if (visible.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyBody}>{emptyBody}</Text>
        {onRefresh && (
          <Button
            label="Refresh queue"
            onPress={onRefresh}
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
      {visible
        .map((item, i) => ({ item, stackIndex: i }))
        .reverse()
        .map(({ item, stackIndex }) => (
          <React.Fragment key={`${keyOf(item)}-${index + stackIndex}`}>
            {renderCard({
              item,
              isTop: stackIndex === 0,
              stackIndex,
              onSwiped: handleSwiped,
              onTap: stackIndex === 0 ? handleTap : undefined,
            })}
          </React.Fragment>
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
    fontFamily: 'Outfit-Bold',
    letterSpacing: -0.3,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
