import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, rhythm, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const profileStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.screenTop,
    paddingBottom: rhythm.tabClearance + spacing[4],
    gap: rhythm.sectionGap,
  },
  pageHeader: {
    gap: spacing[1],
  },
  eyebrow: {
    ...typography.sectionEyebrow,
    color: colors.goldBright,
  },
  pageTitle: {
    ...typography.screenTitle,
    color: colors.text,
  },
  hero: {
    padding: spacing[5],
    gap: spacing[5],
    borderRadius: 28,
    backgroundColor: colors.profileCardSurface,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 14,
  },
  profileCardSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  profileCardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1.5],
  },
  displayName: {
    ...typography.identityTitle,
    color: colors.text,
  },
  identityLine: {
    ...typography.screenSubtitle,
    color: colors.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2.5],
    borderRadius: 13,
    backgroundColor: colors.gold,
  },
  roleBadgeText: {
    ...typography.sectionEyebrow,
    color: colors.navyDeep,
  },
  snapshot: {
    gap: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 0,
  },
  scoreBlock: {
    gap: spacing[1],
  },
  scoreLabel: {
    ...typography.sectionEyebrow,
    color: colors.textTertiary,
  },
  scoreValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 56,
    lineHeight: 62,
    color: colors.goldBright,
    letterSpacing: 0,
  },
  seekerHeadline: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  metric: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'center',
    gap: spacing[0.5],
    paddingHorizontal: spacing[3],
    borderRadius: 16,
    backgroundColor: colors.profileCardInset,
    borderWidth: 0,
    overflow: 'hidden',
  },
  metricValue: {
    ...typography.statMedium,
    color: colors.text,
  },
  metricLabel: {
    ...typography.sectionEyebrow,
    color: colors.textTertiary,
  },
  section: {
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: 20,
    backgroundColor: colors.profileCardSurface,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  sectionBody: {
    gap: spacing[2],
  },
  settingsRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: 16,
    backgroundColor: colors.profileCardInset,
    borderWidth: 0,
    overflow: 'hidden',
  },
  rowIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.goldGlow,
  },
  settingsLabel: {
    flex: 0.8,
    ...typography.rowTitle,
    color: colors.text,
  },
  settingsValue: {
    flex: 1,
    ...typography.rowMeta,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  settingsToggleValue: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  chipGroup: {
    gap: spacing[2],
  },
  chipGroupTitle: {
    ...typography.rowTitle,
    color: colors.text,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    maxWidth: '100%',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: 14,
    backgroundColor: colors.profileCardInset,
    borderWidth: 0,
    overflow: 'hidden',
  },
  chipText: {
    ...typography.chipLabel,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.rowMeta,
    color: colors.textTertiary,
  },
  actionRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: 16,
    backgroundColor: colors.profileCardInset,
    borderWidth: 0,
    overflow: 'hidden',
  },
  actionCopy: {
    flex: 1,
    gap: spacing[0.5],
  },
  actionLabel: {
    ...typography.rowCaption,
    color: colors.textTertiary,
  },
  actionValue: {
    ...typography.rowTitle,
    color: colors.text,
  },
  signOutBtn: {
    marginTop: spacing[1],
  },
});
