import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const activeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  list: { padding: layout.screenPaddingH, gap: spacing[4], paddingBottom: 116 },
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
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
