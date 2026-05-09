import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

export type SwipeDirection = 'request' | 'pass';

/** Imperative swipe callback registered by the top card so external buttons
 *  (Pass / Endorse / Undo) can drive the same off-screen animation as a real
 *  gesture. */
export type SwipeCommand = (direction: SwipeDirection) => void;

/** Optional entry animation triggered when a card becomes top — used after
 *  Undo so the restored card flies back in from the side it left from. */
export type EntryFrom = 'left' | 'right' | null;

export interface SwipeDeckRenderArgs<T> {
  item: T;
  isTop: boolean;
  stackIndex: number;
  /** -1..1, signed normalized magnitude of the top card's drag. Read by back
   *  cards for depth feedback, written by the top card via gesture. */
  headProgress: SharedValue<number>;
  /** When non-null, the top card should enter from this side and settle to
   *  center. Drives the post-undo restore animation. */
  entryFrom: EntryFrom;
  /** Fires the moment the top card commits to a swipe (start of fly-off),
   *  not when fly-off completes. Use for immediate reactions like
   *  celebrations so visuals stay in lock-step with the gesture. */
  onCommitStart?: (direction: SwipeDirection) => void;
  /** Fires when the fly-off animation completes. Parent should advance the
   *  deck pointer here. */
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
  /** Top card calls this in its mount effect to register its imperative swipe
   *  function with the deck. Back cards may pass-through; only the top card's
   *  registration is honored. */
  registerSwipe?: (cmd: SwipeCommand) => void;
}

export interface SwipeDeckHandle {
  /** Swipe the current top card programmatically. No-op if deck is empty. */
  swipe: (direction: SwipeDirection) => void;
  /** Restore the most recently swiped card, or no-op if history is empty. */
  undo: () => void;
  /** Whether undo is available. Reactive via the `canUndo` prop callback. */
  canUndo: () => boolean;
}

interface SwipeDeckProps<T> {
  items: T[];
  /** Current top-of-deck pointer — lifted to parent so modal commits can advance. */
  index: number;
  keyOf: (item: T) => string;
  renderCard: (args: SwipeDeckRenderArgs<T>) => ReactElement;
  /** Fires immediately when a swipe commits (start of fly-off). Use for
   *  reactions that should overlap with the card's exit animation
   *  (celebration, etc.). */
  onSwipeCommitStart?: (item: T, direction: SwipeDirection) => void;
  /** Called when fly-off completes. Parent should record the action and advance. */
  onSwipe: (item: T, direction: SwipeDirection) => void;
  /** Called when top card is tapped (not dragged). */
  onCardTap?: (item: T) => void;
  /** Called when the deck runs out and user taps refresh. */
  onRefresh?: () => void;
  /** Called when the user requests undo via the imperative ref. Parent should
   *  decrement its index; the deck handles the entry animation. */
  onUndo?: () => void;
  /** Notified whenever undo availability changes. Lets the parent show/hide
   *  the rewind button without polling. */
  onCanUndoChange?: (canUndo: boolean) => void;
  emptyTitle?: string;
  emptyBody?: string;
}

function SwipeDeckInner<T>(
  {
    items,
    index,
    keyOf,
    renderCard,
    onSwipeCommitStart,
    onSwipe,
    onCardTap,
    onRefresh,
    onUndo,
    onCanUndoChange,
    emptyTitle = "You're caught up",
    emptyBody = "No more cards in today's queue.",
  }: SwipeDeckProps<T>,
  ref: ForwardedRef<SwipeDeckHandle>,
) {
  /**
   * Shared head-card progress (-1..1). Owned by the deck so back cards can
   * subscribe to the top card's drag without prop-threading. Top card writes
   * on each gesture frame; we reset to 0 when the top card changes (after a
   * swipe commits or undo restores).
   */
  const headProgress = useSharedValue(0);

  // History of (itemId, direction) tuples — the most recent commit lives at
  // the tail. Used to drive Undo. Cleared if the parent rebuilds the queue
  // (detected via items reference change).
  const historyRef = useRef<Array<{ id: string; direction: SwipeDirection }>>([]);
  const lastItemsRef = useRef(items);
  if (items !== lastItemsRef.current) {
    historyRef.current = [];
    lastItemsRef.current = items;
  }

  // When undo restores a card, we mark which side it should enter from. The
  // top card consumes this once on mount and clears it.
  const [entryFrom, setEntryFrom] = useState<EntryFrom>(null);

  // The top card registers its imperative swipe handler here so the deck can
  // drive it from external triggers (action buttons, undo, etc.).
  const topSwipeCmdRef = useRef<SwipeCommand | null>(null);
  const registerSwipe = useCallback<NonNullable<SwipeDeckRenderArgs<T>['registerSwipe']>>(
    (cmd) => {
      topSwipeCmdRef.current = cmd;
    },
    [],
  );

  /**
   * Notify the parent when undo availability flips. Done in an effect rather
   * than on each render so we don't churn parent state on identical values.
   */
  const canUndoNow = historyRef.current.length > 0;
  useEffect(() => {
    if (onCanUndoChange) onCanUndoChange(canUndoNow);
  }, [canUndoNow, onCanUndoChange]);

  /**
   * Reset head-progress whenever the top card identity changes. Must run
   * synchronously with the render that swaps top cards so back cards don't
   * read a stale ±1 value for one frame.
   */
  const topId = items[index] ? keyOf(items[index]) : null;
  useEffect(() => {
    // Spring (not snap) so the rising back card's reactive lift recedes
    // smoothly into its new top-slot rather than dipping for one frame.
    headProgress.value = withSpring(0, { stiffness: 220, damping: 22 });
    topSwipeCmdRef.current = null;
  }, [topId, headProgress]);

  /**
   * Once the entry animation for a restored card has had a chance to start,
   * clear the entryFrom flag so the next top-card change doesn't replay it.
   */
  useEffect(() => {
    if (entryFrom === null) return;
    // Two RAFs so the consuming card has time to read the prop on mount.
    const id = setTimeout(() => setEntryFrom(null), 32);
    return () => clearTimeout(id);
  }, [entryFrom]);

  // Wrap parent's onSwipe so we can record the commit for undo.
  const handleSwipeCommit = useCallback(
    (item: T, direction: SwipeDirection) => {
      historyRef.current = [
        ...historyRef.current,
        { id: keyOf(item), direction },
      ];
      onSwipe(item, direction);
    },
    [keyOf, onSwipe],
  );

  const handleSwiped = useCallback(
    (direction: SwipeDirection) => {
      const item = items[index];
      if (item) handleSwipeCommit(item, direction);
    },
    [items, index, handleSwipeCommit],
  );

  const handleCommitStart = useCallback(
    (direction: SwipeDirection) => {
      const item = items[index];
      if (item && onSwipeCommitStart) onSwipeCommitStart(item, direction);
    },
    [items, index, onSwipeCommitStart],
  );

  const handleTap = useCallback(() => {
    const item = items[index];
    if (item && onCardTap) onCardTap(item);
  }, [items, index, onCardTap]);

  // Imperative API
  useImperativeHandle(
    ref,
    () => ({
      swipe: (direction) => {
        const cmd = topSwipeCmdRef.current;
        if (!cmd) return;
        cmd(direction);
      },
      undo: () => {
        if (historyRef.current.length === 0) return;
        const last = historyRef.current[historyRef.current.length - 1];
        historyRef.current = historyRef.current.slice(0, -1);
        // Direction tells the deck which side to enter from on the new top.
        setEntryFrom(last.direction === 'request' ? 'right' : 'left');
        if (onUndo) onUndo();
      },
      canUndo: () => historyRef.current.length > 0,
    }),
    [onUndo],
  );

  const visible = useMemo(
    () => items.slice(index, index + 3),
    [items, index],
  );

  if (visible.length === 0) {
    return (
      <Animated.View
        style={styles.empty}
        entering={FadeIn.duration(360).easing(Easing.out(Easing.cubic))}
        exiting={FadeOut.duration(180)}
      >
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
      </Animated.View>
    );
  }

  return (
    <View style={styles.deck}>
      {visible
        .map((item, i) => ({ item, stackIndex: i }))
        // Render back-to-front so the top card sits above the deck. We slice
        // copy first because reverse() mutates in place.
        .slice()
        .reverse()
        .map(({ item, stackIndex }) => (
          <React.Fragment key={keyOf(item)}>
            {renderCard({
              item,
              isTop: stackIndex === 0,
              stackIndex,
              headProgress,
              entryFrom: stackIndex === 0 ? entryFrom : null,
              onCommitStart: stackIndex === 0 ? handleCommitStart : undefined,
              onSwiped: handleSwiped,
              onTap: stackIndex === 0 ? handleTap : undefined,
              registerSwipe: stackIndex === 0 ? registerSwipe : undefined,
            })}
          </React.Fragment>
        ))}
    </View>
  );
}

/**
 * Generic swipe deck. Renders top 3 cards for performance, exposes an
 * imperative ref so external buttons can drive the same animation as the
 * gesture, and tracks a history of commits for undo.
 *
 * Parent owns the index — letting modal commits or undo advance/retreat the
 * deck without internal duplication of state.
 */
export const SwipeDeck = forwardRef(SwipeDeckInner) as <T>(
  props: SwipeDeckProps<T> & { ref?: Ref<SwipeDeckHandle> },
) => ReactElement;

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

