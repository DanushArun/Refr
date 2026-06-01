import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, rhythm, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const activeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[5],
  },
  loadingSignal: {
    width: 112,
    height: 56,
    opacity: 0.68,
  },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.screenTop,
    paddingBottom: rhythm.headerBottom,
    gap: spacing[1],
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  list: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.sectionGap,
    paddingBottom: rhythm.tabClearance,
    gap: rhythm.sectionGap,
  },
  noticePill: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldGlow,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  noticeText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: colors.goldBright,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptySignal: {
    width: 132,
    height: 60,
    marginBottom: spacing[1],
    opacity: 0.48,
  },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
