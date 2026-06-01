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
    ...typography.label,
    color: colors.goldBright,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.text,
  },
  hero: {
    padding: spacing[5],
    gap: spacing[5],
    borderRadius: 28,
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.border,
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
    ...typography.h3,
    color: colors.text,
  },
  identityLine: {
    ...typography.bodySmall,
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
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    color: colors.navyDeep,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  snapshot: {
    gap: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scoreBlock: {
    gap: spacing[1],
  },
  scoreLabel: {
    ...typography.label,
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
    backgroundColor: colors.surfaceInset,
  },
  metricValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0,
  },
  metricLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  section: {
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: 20,
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
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
    backgroundColor: colors.surfaceInset,
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
    ...typography.bodySmall,
    color: colors.text,
  },
  settingsValue: {
    flex: 1,
    ...typography.bodySmall,
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
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.text,
    letterSpacing: 0,
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
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0,
  },
  emptyText: {
    ...typography.bodySmall,
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
    backgroundColor: colors.surfaceInset,
  },
  actionCopy: {
    flex: 1,
    gap: spacing[0.5],
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actionValue: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0,
  },
  signOutBtn: {
    marginTop: spacing[1],
  },
});
