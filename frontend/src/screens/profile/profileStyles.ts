import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const profileStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: spacing[20],
    gap: spacing[6],
  },
  profileCard: { gap: spacing[5] },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  profileMeta: { flex: 1, gap: spacing[2] },
  displayName: { ...typography.h3, color: colors.text },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
    borderRadius: 100,
    backgroundColor: colors.goldGlow,
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
  },
  endorserPanel: {
    borderRadius: layout.cardBorderRadius,
    padding: spacing[4],
    gap: spacing[4],
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.goldGlow,
  },
  endorserTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  endorserCopy: { flex: 1, gap: spacing[1] },
  endorserTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  endorserCompany: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  scoreSeal: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldGlow,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  scoreValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 26,
    color: colors.text,
  },
  scoreLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 7,
    lineHeight: 9,
    color: colors.textTertiary,
    letterSpacing: 0,
    textAlign: 'center',
  },
  profileDetail: { gap: spacing[2] },
  profileDetailText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileDetailSub: {
    ...typography.caption,
    color: colors.accent,
  },
  headline: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  endorserMetrics: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing[2],
    backgroundColor: colors.surfaceLevel1,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing[3.5],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingsLabel: { ...typography.body, color: colors.text },
  settingsValue: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  settingsToggleValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: spacing[3],
  },
  signOutBtn: { marginTop: spacing[4] },
  roleSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing[3.5],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roleSwitchCopy: { flex: 1 },
  roleSwitchLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  roleSwitchValue: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
  },
});
