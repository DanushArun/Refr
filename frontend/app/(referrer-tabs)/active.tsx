import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import type { ReferrerInboxItem, ReferralStatus } from '@refr/shared';
import { referralsApi } from '../../src/services/api';
import { Button } from '../../src/components/common/Button';
import { EndorserVoyageCard } from '../../src/components/activity/EndorserVoyageCard';
import { FilterBar, type FilterOption } from '../../src/components/common/FilterBar';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';

const PAYOUT_PER_HIRE = 22000;

// Everything that's post-match (match established, whether or not submitted yet)
const ACTIVE_STATES: Set<ReferralStatus> = new Set([
  'accepted',      // legacy: treat as matched
  'submitted',
  'interviewing',
  'hired',
]);

/** Stage taxonomy for the FilterBar — same axis the seeker pipeline uses,
 *  so both sides of the marketplace see the voyage in the same stages. */
type StageFilter = 'all' | 'matched' | 'submitted' | 'interviewing' | 'hired';

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'hired', label: 'Hired' },
];

function bucketFor(status: ReferralStatus): Exclude<StageFilter, 'all'> | null {
  if (status === 'accepted') return 'matched';
  if (status === 'submitted') return 'submitted';
  if (status === 'interviewing') return 'interviewing';
  if (status === 'hired') return 'hired';
  return null;
}

/** Sort order: closest-to-hired first, hired (done) at the bottom.
 *  Drives urgency — interviewing needs action soonest, hired is celebratory. */
const STAGE_SORT_RANK: Record<string, number> = {
  interviewing: 0,
  submitted: 1,
  accepted: 2,
  requested: 2,
  hired: 3,
};

function latestTimestampForStage(r: ReferrerInboxItem['referral']): string | undefined {
  // Use the most recent stamp for the "X ago" display
  if (r.status === 'hired') return r.outcomeAt ?? r.submittedAt ?? r.acceptedAt;
  if (r.status === 'interviewing') return r.submittedAt ?? r.acceptedAt;
  if (r.status === 'submitted') return r.submittedAt ?? r.acceptedAt;
  return r.acceptedAt ?? r.requestedAt;
}

export default function ActiveRoute() {
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await referralsApi.getInbox();
      setItems(data.filter((i) => ACTIVE_STATES.has(i.referral.status)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filteredItems = useMemo(() => {
    if (stageFilter === 'all') return items;
    return items.filter((it) => bucketFor(it.referral.status) === stageFilter);
  }, [items, stageFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const rankA = STAGE_SORT_RANK[a.referral.status] ?? 99;
      const rankB = STAGE_SORT_RANK[b.referral.status] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      // Secondary — most recently active within same stage
      const tA = latestTimestampForStage(a.referral);
      const tB = latestTimestampForStage(b.referral);
      return new Date(tB ?? 0).getTime() - new Date(tA ?? 0).getTime();
    });
  }, [filteredItems]);

  // Stage counts on the unfiltered set so chip badges don't re-shuffle as
  // the user toggles between filters.
  const stageCounts = useMemo(() => {
    const out: Record<Exclude<StageFilter, 'all'>, number> = {
      matched: 0,
      submitted: 0,
      interviewing: 0,
      hired: 0,
    };
    for (const it of items) {
      const b = bucketFor(it.referral.status);
      if (b) out[b] += 1;
    }
    return out;
  }, [items]);

  const filterOptions = useMemo<readonly FilterOption<StageFilter>[]>(
    () =>
      STAGE_FILTERS.map((opt) => ({
        ...opt,
        count: opt.key === 'all' ? items.length : stageCounts[opt.key],
      })),
    [stageCounts, items.length],
  );

  // Subtitle counts: kept here for context (in-flight + hired-this-month);
  // ₹ values now live on the Earnings tab per founder direction.
  const { hiredThisMonth, inFlightCount } = useMemo(() => {
    let thisMonth = 0;
    let inFlight = 0;
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    for (const it of items) {
      if (it.referral.status === 'hired') {
        const t = it.referral.outcomeAt ? new Date(it.referral.outcomeAt).getTime() : 0;
        if (t >= start.getTime()) thisMonth += 1;
      } else {
        inFlight += 1;
      }
    }
    return { hiredThisMonth: thisMonth, inFlightCount: inFlight };
  }, [items]);

  const transition = useCallback(
    async (id: string, next: ReferralStatus, message: string) => {
      setPendingId(id);
      try {
        const updated = await referralsApi.transition(id, next);
        setItems((prev) =>
          prev
            .map((i) => (i.referral.id === id ? { ...i, referral: updated } : i))
            .filter((i) => ACTIVE_STATES.has(i.referral.status)),
        );
        Alert.alert('Updated', message);
      } catch (err) {
        Alert.alert(
          'Could not update',
          err instanceof Error ? err.message : 'Please try again.',
        );
      } finally {
        setPendingId(null);
      }
    },
    [],
  );

  const handleAction = useCallback(
    (item: ReferrerInboxItem, kind: 'submit' | 'interviewing' | 'outcome' | 'view') => {
      if (kind === 'submit') {
        Alert.alert(
          `Submit ${item.seekerName} to HR?`,
          'Marks the endorsement as formally submitted. The seeker sees it move forward.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit',
              onPress: () =>
                transition(item.referral.id, 'submitted', `${item.seekerName} submitted to HR.`),
            },
          ],
        );
        return;
      }
      if (kind === 'interviewing') {
        Alert.alert('Mark interviewing?', 'Confirms the seeker has started interviews.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () =>
              transition(item.referral.id, 'interviewing', `${item.seekerName} now interviewing.`),
          },
        ]);
        return;
      }
      if (kind === 'outcome') {
        Alert.alert('Record outcome', `Outcome for ${item.seekerName}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Rejected',
            style: 'destructive',
            onPress: () =>
              transition(item.referral.id, 'rejected', 'Outcome recorded.'),
          },
          {
            text: 'Hired +10',
            onPress: () =>
              transition(item.referral.id, 'hired', `${item.seekerName} hired. Endorsement +10.`),
          },
        ]);
        return;
      }
      // view — noop in Phase 1, could route to detail
    },
    [transition],
  );

  const handleChat = useCallback((item: ReferrerInboxItem) => {
    router.push({
      pathname: '/chat',
      params: {
        referralId: item.referral.id,
        participantName: item.seekerName,
        participantAvatar: item.seekerAvatar,
        participantSubtitle: item.seekerHeadline,
        targetRole: item.referral.targetRole,
        companyName: 'Razorpay',
        stage: item.referral.status,
      },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyBody}>{error}</Text>
          <Button label="Retry" onPress={load} variant="primary" size="medium" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          {inFlightCount} in flight · {hiredThisMonth} hired this month
        </Text>
      </View>

      {items.length > 0 && (
        <FilterBar
          options={filterOptions}
          current={stageFilter}
          onChange={setStageFilter}
          ariaLabel="Active stage filter"
        />
      )}

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing active</Text>
          <Text style={styles.emptyBody}>
            Swipe right on Seekers in Discover. Matches that pass through their chat land here.
          </Text>
        </View>
      ) : sortedItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing in this lane</Text>
          <Text style={styles.emptyBody}>
            No referrals match this filter yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(i) => i.referral.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={load}
          refreshing={loading}
          renderItem={({ item }) => {
            const ts = latestTimestampForStage(item.referral);
            return (
              <EndorserVoyageCard
                data={{
                  id: item.referral.id,
                  seekerName: item.seekerName,
                  seekerAvatar: item.seekerAvatar,
                  seekerHeadline: item.seekerHeadline,
                  targetRole: item.referral.targetRole,
                  // The referrer's own employer drives the office hero —
                  // that's the destination they're shepherding to. We
                  // hardcode 'Razorpay' here because the seeded demo
                  // referrer is at Razorpay; this should pull from the
                  // referrer's profile once the API surfaces it.
                  companyName: 'Razorpay',
                  status: item.referral.status,
                  stageTimestamp: ts,
                  payoutAmount: PAYOUT_PER_HIRE,
                }}
                pending={pendingId === item.referral.id}
                onAction={(kind) => handleAction(item, kind)}
                onChat={() => handleChat(item)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  list: { padding: layout.screenPaddingH, gap: spacing[4], paddingBottom: 116 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptyBody: { ...typography.body, color: colors.textTertiary, textAlign: 'center', lineHeight: 24 },
});
