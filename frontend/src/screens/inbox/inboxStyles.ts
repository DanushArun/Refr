import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { layout, rhythm, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const inboxStyles = StyleSheet.create({
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
  title: { ...typography.screenTitle, color: colors.text },
  subtitle: { ...typography.screenSubtitle, color: colors.textSecondary },
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
    backgroundColor: 'rgba(244, 237, 221, 0.055)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(244, 237, 221, 0.14)',
    overflow: 'hidden',
  },
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
    ...typography.sectionTitle,
    color: colors.text,
  },
  sectionCount: {
    ...typography.statSmall,
    color: colors.textTertiary,
  },
  sectionHint: {
    ...typography.sectionEyebrow,
    color: 'rgba(250, 250, 247, 0.32)',
  },
  activeStack: {
    gap: spacing[2],
  },
  filteredEmpty: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 18,
    backgroundColor: 'rgba(244, 237, 221, 0.055)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(244, 237, 221, 0.14)',
  },
  filteredEmptyText: {
    ...typography.rowMeta,
    color: colors.textSecondary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptyTitle: { ...typography.sectionTitle, color: colors.text },
  emptyBody: {
    ...typography.rowMeta,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
