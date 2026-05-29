import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';

export const MARKER_WIDTH = 52;

export const reputationRailStyles = StyleSheet.create({
  card: {
    borderRadius: layout.cardBorderRadiusLarge,
    padding: spacing[4],
    gap: spacing[4],
    overflow: 'hidden',
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
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
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.075)',
  },
  railField: {
    height: 76,
    justifyContent: 'flex-end',
  },
  railBase: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  railFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fillGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  railHighlight: {
    position: 'absolute',
    top: 1,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
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
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },
  rulePositive: {
    color: 'rgba(91, 230, 148, 0.92)',
  },
  ruleNegative: {
    color: 'rgba(255, 115, 145, 0.90)',
  },
  ruleLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textSecondary,
  },
});
