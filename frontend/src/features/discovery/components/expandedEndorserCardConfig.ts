import { Dimensions } from 'react-native';

import type { EndorserCard } from './endorserCardData';

const screen = Dimensions.get('window');

export const SCREEN_HEIGHT = screen.height;
export const CARD_LEFT = 20;
export const CARD_WIDTH = screen.width - 40;
export const CARD_HEIGHT = Math.min(580, Math.round(screen.height * 0.62));
export const CARD_TOP_FROM_SCREEN = 122;
export const EXPANDED_LEFT = 14;
export const EXPANDED_MIN_EDGE = 34;
export const EXPANDED_SAFE_GAP = 10;
export const EXPANDED_WIDTH = screen.width - EXPANDED_LEFT * 2;

export interface ExpandedEndorserCardProps {
  card: EndorserCard | null;
  onClose: () => void;
  onPass: () => void;
  onCommit: () => void;
}
