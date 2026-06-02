import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, rhythm, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const earningsScreenStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.screenTop,
    paddingBottom: rhythm.tabClearance,
    gap: rhythm.sectionGap,
  },
  earningsHero: {
    borderRadius: layout.cardBorderRadiusLarge,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    overflow: 'hidden',
    gap: spacing[2],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 14,
  },
  heroGoldFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadiusLarge,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heroOrbWrap: {
    marginRight: -spacing[1],
    marginVertical: -spacing[1],
  },
  heroTopInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  heroLabel: {
    fontFamily: 'TechFont-Bold',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  heroSub: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.62)',
  },
  heroValue: {
    fontFamily: 'TechFont-Bold',
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: 0,
    color: '#1A1100',
    textShadowColor: 'rgba(255, 255, 255, 0.32)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0.5,
  },
  heroSplits: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing[3],
  },
  heroTile: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  heroTileLabel: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: 'rgba(0, 0, 0, 0.55)',
  },
  heroTileValue: {
    fontFamily: 'TechFont-Bold',
    fontSize: 16,
    letterSpacing: 0,
  },
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadiusLarge,
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  section: { gap: spacing[2] },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  sectionCount: {
    ...typography.sectionEyebrow,
    color: colors.textTertiary,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.095)',
  },
  payoutRowLast: { borderBottomWidth: 0 },
  payoutMeta: { flex: 1, gap: 2 },
  payoutName: {
    ...typography.rowTitle,
    color: colors.text,
  },
  payoutSub: {
    ...typography.rowCaption,
    color: colors.textSecondary,
  },
  payoutRight: { alignItems: 'flex-end', gap: 2 },
  payoutAmount: {
    fontFamily: 'MoneyFont-Regular',
    fontSize: 16,
    color: colors.text,
  },
  payoutDate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
  emptyText: {
    ...typography.rowMeta,
    color: colors.textSecondary,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.095)',
  },
  lbRowLast: { borderBottomWidth: 0 },
  lbRowYou: {
    backgroundColor: colors.goldGlow,
  },
  lbRank: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
    color: colors.goldBright,
    width: 28,
    textAlign: 'center',
  },
  lbMeta: { flex: 1, gap: 2 },
  lbName: {
    ...typography.rowTitle,
    color: colors.text,
  },
  lbCompany: {
    ...typography.rowCaption,
    color: colors.textSecondary,
  },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbScore: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: colors.text,
  },
  lbHires: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
  leaderboardEmpty: {
    ...typography.rowMeta,
    color: colors.textSecondary,
    padding: spacing[4],
  },
  glassCardBody: {
    padding: spacing[4],
  },
});
