import { Dimensions } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { EndorserCard } from './endorserCardData';
import type { EntryFrom, SwipeCommand, SwipeDirection } from './SwipeDeck';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
export const FLY_OFF_X = WINDOW_WIDTH * 1.4;
export const SWIPE_OUT_MS = 220;
export const ENTRY_IN_MS = 320;
export const MAX_DRIFT_Y = 90;
export const BACK_RISE_TRANSLATE_Y = 8;
export const BACK_RISE_SCALE = 0.025;

export interface EndorserCardProps {
  card: EndorserCard;
  isTop: boolean;
  stackIndex: number;
  headProgress: SharedValue<number>;
  entryFrom: EntryFrom;
  swipesRemaining: number;
  canUndo?: boolean;
  onUndo?: () => void;
  onCommitStart?: (direction: SwipeDirection) => void;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
  registerSwipe?: (command: SwipeCommand) => void;
}
