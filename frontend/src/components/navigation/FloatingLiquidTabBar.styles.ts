import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import {
  LIQUID_TAB_BAR_ICON_SIZE,
  LIQUID_TAB_BAR_HEIGHT,
  LIQUID_TAB_BAR_RADIUS,
} from './tabBarOptions';

const itemHeight = LIQUID_TAB_BAR_HEIGHT - spacing[3];
const itemRadius = itemHeight / 2;

export const floatingLiquidTabBarStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  bar: {
    alignSelf: 'stretch',
    height: LIQUID_TAB_BAR_HEIGHT,
    marginHorizontal: layout.screenPaddingH,
    overflow: 'hidden',
    borderRadius: LIQUID_TAB_BAR_RADIUS,
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.30,
    shadowRadius: 26,
    elevation: 16,
  },
  surfaceStack: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glassBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[1.5],
  },
  activePill: {
    position: 'absolute',
    top: spacing[1.5],
    height: itemHeight,
    borderRadius: itemRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.105)',
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: itemHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[0.5],
    overflow: 'hidden',
    borderRadius: itemRadius,
    borderWidth: 0,
    zIndex: 1,
  },
  itemFocused: {},
  itemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.145)',
  },
  iconSlot: {
    width: LIQUID_TAB_BAR_ICON_SIZE,
    height: LIQUID_TAB_BAR_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    maxWidth: '100%',
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -13,
    minWidth: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: 9.5,
    backgroundColor: colors.brass,
  },
  badgeText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    lineHeight: 13,
    color: colors.navyDeep,
    letterSpacing: 0,
  },
});
