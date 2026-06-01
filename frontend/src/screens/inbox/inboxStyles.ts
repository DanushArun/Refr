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
    backgroundColor: colors.surfaceLevel1,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(250, 250, 247, 0.10)',
  },
  filteredEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 12,
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
