import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem, ReferralStatus } from '@refr/shared';
import { PaperVoyageCard } from '../components/activity/PaperVoyageCard';
import { hapticSelection } from '../utils/haptics';

type FilterKey = 'all' | 'matched' | 'submitted' | 'interview' | 'hired' | 'closed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interview', label: 'Interview' },
  { key: 'hired', label: 'Hired' },
  { key: 'closed', label: 'Closed' },
];

const STATUSES_FOR: Record<FilterKey, Set<ReferralStatus> | null> = {
  all: null,
  matched: new Set(['requested', 'accepted']),
  submitted: new Set(['submitted']),
  interview: new Set(['interviewing']),
  hired: new Set(['hired']),
  closed: new Set(['rejected', 'withdrawn', 'expired']),
};

function latestStageTimestamp(item: SeekerPipelineItem): string | null | undefined {
  const r = item.referral;
  if (r.status === 'hired') return r.outcomeAt ?? r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  if (r.status === 'interviewing') return r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  if (r.status === 'submitted') return r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  return r.acceptedAt ?? r.requestedAt;
}

// Demo cards — one per voyage stage so all 4 progress states are visible.
const DEMO_PIPELINE: SeekerPipelineItem[] = [
  {
    referral: {
      id: 'demo-matched',
      seekerId: 'demo',
      referrerId: 'demo-r',
      companyId: 'cred',
      targetRole: 'Staff Engineer',
      status: 'accepted',
      matchScore: 88,
      requestedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
      acceptedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
    referrerName: 'Aarav Verma',
    companyName: 'CRED',
  },
  {
    referral: {
      id: 'demo-submitted',
      seekerId: 'demo',
      referrerId: 'demo-r',
      companyId: 'razorpay',
      targetRole: 'Senior Backend Engineer',
      status: 'submitted',
      matchScore: 91,
      requestedAt: new Date(Date.now() - 9 * 86_400_000).toISOString(),
      acceptedAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
      submittedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
    referrerName: 'Priya Iyer',
    companyName: 'Razorpay',
  },
  {
    referral: {
      id: 'demo-interview',
      seekerId: 'demo',
      referrerId: 'demo-r',
      companyId: 'zepto',
      targetRole: 'Product Designer',
      status: 'interviewing',
      matchScore: 84,
      requestedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
      acceptedAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
      submittedAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    },
    referrerName: 'Rohan Mehta',
    companyName: 'Zepto',
  },
  {
    referral: {
      id: 'demo-hired',
      seekerId: 'demo',
      referrerId: 'demo-r',
      companyId: 'swiggy',
      targetRole: 'Engineering Manager',
      status: 'hired',
      matchScore: 96,
      requestedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
      acceptedAt: new Date(Date.now() - 28 * 86_400_000).toISOString(),
      submittedAt: new Date(Date.now() - 25 * 86_400_000).toISOString(),
      outcomeAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
    referrerName: 'Anika Sharma',
    companyName: 'Swiggy',
  },
];

export function PipelineScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const loadPipeline = useCallback(async () => {
    try {
      const data = await referralsApi.getPipeline();
      setItems(data as SeekerPipelineItem[]);
    } catch {
      Alert.alert('Error', 'Failed to load pipeline');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadPipeline(); }, [loadPipeline]));

  const counts = useMemo<Record<FilterKey, number>>(() => {
    const all = [...DEMO_PIPELINE, ...items];
    const c: Record<FilterKey, number> = {
      all: all.length,
      matched: 0,
      submitted: 0,
      interview: 0,
      hired: 0,
      closed: 0,
    };
    for (const it of all) {
      const s = it.referral.status;
      if (STATUSES_FOR.matched!.has(s)) c.matched += 1;
      else if (STATUSES_FOR.submitted!.has(s)) c.submitted += 1;
      else if (STATUSES_FOR.interview!.has(s)) c.interview += 1;
      else if (STATUSES_FOR.hired!.has(s)) c.hired += 1;
      else if (STATUSES_FOR.closed!.has(s)) c.closed += 1;
    }
    return c;
  }, [items]);

  const visibleItems = useMemo(() => {
    const merged = [...DEMO_PIPELINE, ...items];
    const allowed = STATUSES_FOR[filter];
    if (!allowed) return merged;
    return merged.filter((it) => allowed.has(it.referral.status));
  }, [items, filter]);

  const handleFilterChange = useCallback((next: FilterKey) => {
    if (next === filter) return;
    hapticSelection();
    setFilter(next);
  }, [filter]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  const inFlight = counts.matched + counts.submitted + counts.interview;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>
            {inFlight} in flight · {counts.hired} berthed
          </Text>
        </View>

        <FilterBar
          current={filter}
          counts={counts}
          onChange={handleFilterChange}
        />

        {visibleItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing in this lane</Text>
            <Text style={styles.emptyBody}>
              No endorsements match this filter yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleItems}
            keyExtractor={(item) => item.referral.id}
            contentContainerStyle={styles.list}
            onRefresh={() => {
              setRefreshing(true);
              loadPipeline();
            }}
            refreshing={refreshing}
            renderItem={({ item }) => <PipelineItem item={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function FilterBar({
  current,
  counts,
  onChange,
}: {
  current: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (next: FilterKey) => void;
}) {
  return (
    <View style={styles.filterBarWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map((f) => {
          const active = f.key === current;
          const count = counts[f.key];
          const dim = !active && count === 0 && f.key !== 'all';
          return (
            <Pressable
              key={f.key}
              onPress={() => onChange(f.key)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                !active && styles.chipInactive,
                dim && styles.chipDim,
                pressed && !active && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  active ? styles.chipLabelActive : styles.chipLabelInactive,
                  dim && styles.chipLabelDim,
                ]}
              >
                {f.label.toUpperCase()}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.chipCount,
                    active ? styles.chipCountActive : styles.chipCountInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipCountText,
                      active ? styles.chipCountTextActive : styles.chipCountTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function PipelineItem({ item }: { item: SeekerPipelineItem }) {
  return (
    <PaperVoyageCard
      data={{
        companyName: item.companyName,
        role: item.referral.targetRole,
        endorserName: item.referrerName,
        status: item.referral.status,
        stageTimestamp: latestStageTimestamp(item),
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  list: {
    padding: layout.screenPaddingH,
    gap: spacing[4],
    paddingBottom: spacing[20],
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

  filterBarWrap: {
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(212, 167, 68, 0.18)',
    marginBottom: spacing[3],
  },
  filterBarContent: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing[2],
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
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
  chipLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  chipLabelActive: { color: '#0A1F44' },
  chipLabelInactive: { color: colors.gold },
  chipLabelDim: { color: 'rgba(212, 167, 68, 0.45)' },

  chipCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCountActive: {
    backgroundColor: 'rgba(10, 31, 68, 0.18)',
  },
  chipCountInactive: {
    backgroundColor: 'rgba(212, 167, 68, 0.14)',
  },
  chipCountText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    letterSpacing: 0,
  },
  chipCountTextActive: { color: '#0A1F44' },
  chipCountTextInactive: { color: colors.gold },
});
