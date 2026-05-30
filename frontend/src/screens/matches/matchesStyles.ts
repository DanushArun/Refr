import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, rhythm, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const matchesStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.screenTop,
    paddingBottom: rhythm.headerBottom,
    gap: spacing[1],
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  scroll: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  topContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[3],
    paddingBottom: rhythm.sectionGap,
  },
  contentSheet: {
    flexGrow: 1,
    minHeight: '100%',
    gap: rhythm.sectionGap,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.sheetTop,
    paddingBottom: rhythm.tabClearance + spacing[4],
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: colors.surfaceLevel1,
    overflow: 'hidden',
  },
  skelCarousel: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  skelTile: {
    alignItems: 'center',
    width: 76,
  },
  skelActiveStack: {
    gap: 8,
    marginTop: spacing[3],
  },
  skelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceInset,
  },
  skelRowMiddle: { flex: 1 },
  activeWrap: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing[2],
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0,
  },
  sectionCount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: colors.textTertiary,
  },
  sectionHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  activeStack: { gap: spacing[2] },
  filteredEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  filteredEmptyText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  inlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.warningLight,
  },
  inlineNoticeText: {
    flex: 1,
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptyTitle: { ...typography.h4, color: colors.text },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyAction: {
    marginTop: spacing[2],
    minWidth: 156,
  },
});
