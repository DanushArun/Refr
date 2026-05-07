import React, { useCallback, useState, type ReactElement } from 'react';
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
}

interface SwipeDeckProps<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (args: SwipeDeckRenderArgs<T>) => ReactElement;
  onSwipe: (item: T, direction: SwipeDirection) => void;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
}

/**
 * Generic swipe deck — renders any card type via the renderCard prop.
 * Owns the stack index state; fires onSwipe after each committed gesture.
 * Only the top card accepts gestures (see isTop flag passed to renderCard).
 */
export function SwipeDeck<T>({
  items,
  keyOf,
  renderCard,
  onSwipe,
  onRefresh,
  emptyTitle = "You're caught up",
  emptyBody = 'No more cards in today\'s queue. Check back later.',
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);

  const handleSwiped = useCallback(
    (direction: SwipeDirection) => {
      const item = items[index];
      if (item) onSwipe(item, direction);
      setIndex((i) => i + 1);
    },
    [items, index, onSwipe],
  );

  const visible = items.slice(index, index + 3);

  if (visible.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyBody}>{emptyBody}</Text>
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
