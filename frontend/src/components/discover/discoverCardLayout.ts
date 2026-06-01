import { Dimensions } from 'react-native';
import { layout, spacing } from '../../theme/spacing';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export const DISCOVER_CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.62));

export const discoverCardLayout = {
  inset: layout.screenPaddingH,
  radius: 32,
  overlayGap: spacing[2],
  overlayPaddingBottom: spacing[7],
  overlayPaddingHorizontal: spacing[6],
  titleRowGap: spacing[3],
  chipHeight: spacing[8],
  chipRadius: spacing[4],
  chipPaddingHorizontal: spacing[3],
} as const;
