import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { officeImageUrlFor } from '../components/activity/companyOffices';
import { prefetchImages } from '../utils/prefetchImages';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem, ReferralStatus } from '@refr/shared';
import { PaperVoyageCard } from '../components/activity/PaperVoyageCard';
import { Skeleton } from '../components/common/Skeleton';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';
import { Phrase } from '../utils/haptics';
import { useWarmTabData } from '../hooks/useWarmTabData';

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
    referrerName: 'Anita Desai',
    companyName: 'Swiggy',
  },
];

export function PipelineScreen() {
  const isFocused = useIsFocused();
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

  useWarmTabData(loadPipeline);

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

  // Warm the office-image cache for the full visible list so cards don't
  // flash navy before resolving on first scroll.
  useEffect(() => {
    prefetchImages(visibleItems.map((it) => officeImageUrlFor(it.companyName)));
  }, [visibleItems]);

  // Stable refs so FlatList doesn't re-evaluate them on every parent render
  // — avoids resetting the windowed mount/unmount tracking that
  // removeClippedSubviews relies on.
  const renderItem = useCallback(
    ({ item }: { item: SeekerPipelineItem }) => (
      <PipelineItem item={item} active={isFocused} />
    ),
    [isFocused],
  );
  const keyExtractor = useCallback(
    (item: SeekerPipelineItem) => item.referral.id,
    [],
  );

  const handleFilterChange = useCallback((next: FilterKey) => {
    setFilter(next);
  }, []);

  const filterOptions = useMemo<readonly FilterOption<FilterKey>[]>(
    () => FILTERS.map((f) => ({ ...f, count: counts[f.key] })),
    [counts],
  );

  if (loading) {
    // Skeleton placeholder cards — same overall rhythm as the real list so
    // the layout doesn't jump when the API resolves.
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text style={styles.title}>Activity</Text>
            <Skeleton width={140} height={14} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.list}>
            <PipelineSkeletonCard />
            <PipelineSkeletonCard />
            <PipelineSkeletonCard />
          </View>
        </SafeAreaView>
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
          options={filterOptions}
          current={filter}
          onChange={handleFilterChange}
          ariaLabel="Pipeline stage filter"
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
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.list}
            onRefresh={() => {
              Phrase.pullRefresh();
              setRefreshing(true);
              loadPipeline();
            }}
            refreshing={refreshing}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            // Each card runs a useFrameCallback + per-frame Skia path rebuilds
            // for the BoatVoyage. Off-screen cards must be unmounted, not just
            // hidden — otherwise every animation runs continuously.
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

/**
 * Memoized so each card only re-renders when its own data actually changes.
 * Without this, scrolling the FlatList re-renders every visible card on each
 * pass — and each card runs a per-frame BoatVoyage worklet, so dropping the
 * spurious renders is a real perf win.
 */
const PipelineItem = React.memo(
  function PipelineItem({
    item,
    active,
  }: {
    item: SeekerPipelineItem;
    active: boolean;
  }) {
    return (
      <PaperVoyageCard
        active={active}
        data={{
          companyName: item.companyName,
          role: item.referral.targetRole,
          endorserName: item.referrerName,
          status: item.referral.status,
          stageTimestamp: latestStageTimestamp(item),
        }}
      />
    );
  },
  (prev, next) =>
    prev.active === next.active &&
    prev.item.referral.id === next.item.referral.id &&
    prev.item.referral.status === next.item.referral.status &&
    prev.item.companyName === next.item.companyName &&
    prev.item.referrerName === next.item.referrerName,
);

/**
 * Skeleton card mirroring the real PaperVoyageCard's silhouette — image hero
 * up top, title + role bars, endorser line, and a wave/label strip — so the
 * loading state matches the layout of the resolved content.
 */
function PipelineSkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width="100%" height={112} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton width={160} height={20} />
        <Skeleton width={120} height={14} />
        <Skeleton width={200} height={12} style={{ marginTop: 4 }} />
        <Skeleton width="100%" height={28} style={{ marginTop: 14 }} />
      </View>
    </View>
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
  skeletonCard: {
    height: 280,
    borderRadius: layout.cardBorderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.16)',
  },
  skeletonBody: {
    padding: 18,
    gap: 8,
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
