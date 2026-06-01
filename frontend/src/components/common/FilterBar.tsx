import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';

/**
 * FilterBar — the single source of truth for filter chips across every list
 * surface in the app (Discover, Matches, Pipeline, Inbox, Active, Endorser
 * Discover). Earnings and Profile do not use filters by design.
 *
 * Visual language: gold rim chips on a transparent background; active chip
 * is a solid gold fill with a navy label. Optional per-chip count badge —
 * dim when zero so the user can see at a glance which buckets are empty
 * without losing the option.
 *
 * Generic over the filter key so each screen can express its own taxonomy
 * (status, company, experience, content type, …) without losing type
 * safety.
 */

export type FilterOption<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

export type FilterBarProps<T extends string> = {
  options: readonly FilterOption<T>[];
  current: T;
  onChange: (next: T) => void;
  /**
   * When true, the count badge is rendered for every option that has a
   * `count` set. When false, badges are hidden even if counts are present —
   * useful on Discover where chip counts would be noise.
   */
  showCounts?: boolean;
  /** Optional accessible label for screen readers. */
  ariaLabel?: string;
};

export function FilterBar<T extends string>({
  options,
  current,
  onChange,
  showCounts = true,
  ariaLabel = 'Filters',
}: FilterBarProps<T>) {
  const handlePress = (key: T) => {
    if (key === current) return;
    Phrase.tick();
    onChange(key);
  };

  return (
    <View style={styles.wrap} accessibilityRole="tablist" accessibilityLabel={ariaLabel}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {options.map((opt) => {
          const active = opt.key === current;
          const count = opt.count;
          const hasCount = showCounts && typeof count === 'number';
          // Only the "all" sentinel stays bright when empty; bucket chips dim
          // when their count is zero so the user can scan at a glance.
          const dim = !active && hasCount && count === 0 && opt.key !== 'all';

          return (
            <PressableScale
              key={opt.key}
              hitSlop={{ top: 9, bottom: 9, left: 8, right: 8 }}
              onPress={() => handlePress(opt.key)}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
                dim && styles.chipDim,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                hasCount ? `${opt.label}, ${count} item${count === 1 ? '' : 's'}` : opt.label
              }
            >
              <Text
                style={[
                  styles.label,
                  active ? styles.labelActive : styles.labelInactive,
                  dim && styles.labelDim,
                ]}
              >
                {opt.label}
              </Text>
              {hasCount && count! > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    active ? styles.countBadgeActive : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      active ? styles.countTextActive : styles.countTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing[2],
    marginBottom: spacing[2],
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(212, 167, 68, 0.45)',
  },
  chipDim: {
    borderColor: 'rgba(212, 167, 68, 0.18)',
  },
  label: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  labelActive: { color: '#0A1F44' },
  labelInactive: { color: colors.gold },
  labelDim: { color: 'rgba(212, 167, 68, 0.45)' },
  countBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: { backgroundColor: 'rgba(10, 31, 68, 0.18)' },
  countBadgeInactive: { backgroundColor: 'rgba(212, 167, 68, 0.14)' },
  countText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 9,
    letterSpacing: 0,
  },
  countTextActive: { color: '#0A1F44' },
  countTextInactive: { color: colors.gold },
});
