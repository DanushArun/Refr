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
    color: 'rgba(250, 250, 247, 0.32)',
    letterSpacing: 0.3,
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
});
