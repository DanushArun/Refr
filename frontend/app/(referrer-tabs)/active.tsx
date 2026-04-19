import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { MatchCard, type MatchCardData } from '../../src/components/activity/MatchCard';
import type { PipelineStage } from '../../src/components/activity/PipelineStepper';
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

function timeAgo(iso?: string | null): string {
  if (!iso) return 'Just now';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function stageLabelFor(status: ReferralStatus): string {
  if (status === 'accepted' || status === 'requested') return 'Matched';
  if (status === 'submitted') return 'Submitted';
  if (status === 'interviewing') return 'Interviewing';
  if (status === 'hired') return 'Hired';
  return status;
}

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

  useEffect(() => { load(); }, [load]);

  const { pendingValue, paidValue, hiredThisMonth } = useMemo(() => {
    let pending = 0;
    let paid = 0;
    let thisMonth = 0;
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    for (const it of items) {
      if (it.referral.status === 'hired') {
        paid += PAYOUT_PER_HIRE;
        const t = it.referral.outcomeAt ? new Date(it.referral.outcomeAt).getTime() : 0;
        if (t >= start.getTime()) thisMonth += 1;
      } else {
        pending += PAYOUT_PER_HIRE;
      }
    }
    return { pendingValue: pending, paidValue: paid, hiredThisMonth: thisMonth };
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

  const formatINR = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          {items.length} in flight · {hiredThisMonth} hired this month
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing active</Text>
          <Text style={styles.emptyBody}>
            Swipe right on Seekers in Discover. Matches that pass through their chat land here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.referral.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={load}
          refreshing={loading}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <SummaryTile label="Pending" value={formatINR(pendingValue)} accent />
              <SummaryTile label="Earned" value={formatINR(paidValue)} success />
              <SummaryTile label="In flight" value={String(items.length)} />
            </View>
          }
          renderItem={({ item }) => {
            const status = item.referral.status as ReferralStatus;
            const stageLabel = stageLabelFor(status);
            const ts = latestTimestampForStage(item.referral);
            const card: MatchCardData = {
              id: item.referral.id,
              counterpartName: item.seekerName,
              counterpartAvatar: item.seekerAvatar,
              counterpartSubtitle: item.seekerHeadline,
              targetRole: item.referral.targetRole,
              companyName: 'Razorpay',
              stage: status as PipelineStage,
              timeInStageLabel: `${stageLabel} · ${timeAgo(ts)}`,
              payoutPending: PAYOUT_PER_HIRE,
            };
            return (
              <MatchCard
                match={card}
                viewerRole="endorser"
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

function SummaryTile({
  label,
  value,
  accent,
  success,
}: {
  label: string;
  value: string;
  accent?: boolean;
  success?: boolean;
}) {
  const valueColor = success
    ? colors.success
    : accent
    ? colors.accent
    : colors.text;
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
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
  list: { padding: layout.screenPaddingH, gap: spacing[4], paddingBottom: spacing[20] },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceLevel1,
    borderRadius: 12,
    padding: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  tileValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  tileLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10,
  },
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
