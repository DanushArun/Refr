import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';

export const MARKER_WIDTH = 52;

export const reputationRailStyles = StyleSheet.create({
  card: {
    borderRadius: layout.cardBorderRadiusLarge,
    padding: spacing[4],
    gap: spacing[4],
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadiusLarge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  eyebrow: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0,
  },
  title: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  rankPill: {
    minWidth: 54,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 0,
  },
  rankValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 15,
    color: colors.goldBright,
  },
  rankLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0,
  },
  railPanel: {
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 18,
    backgroundColor: colors.surfaceInset,
    borderWidth: 0,
    overflow: 'hidden',
  },
  railField: {
    height: 76,
    justifyContent: 'flex-end',
  },
  railSignalField: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 12,
    opacity: 0.72,
  },
  railBase: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.085)',
  },
  railFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fillGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: MARKER_WIDTH,
    alignItems: 'center',
  },
  markerCapsule: {
    minWidth: 42,
    height: 30,
    paddingHorizontal: spacing[2],
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldBright,
    shadowColor: colors.goldBright,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  markerValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 15,
    lineHeight: 20,
    color: colors.background,
  },
  markerStem: {
    width: 2,
    height: 14,
    backgroundColor: colors.goldBright,
  },
  markerFoot: {
    width: 12,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.goldBright,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  bound: {
    width: 68,
    gap: 1,
  },
  boundEnd: {
    alignItems: 'flex-end',
  },
  boundValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: colors.text,
  },
  boundLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textTertiary,
  },
  metaHint: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  ruleStrip: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  ruleChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.surfaceLevel2,
    borderWidth: 0,
  },
  ruleValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },
  rulePositive: {
    color: colors.sage,
  },
  ruleNegative: {
    color: colors.vermilion,
  },
  ruleLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textSecondary,
  },
});
