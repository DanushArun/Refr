import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';
import { Avatar } from '../../src/components/common/Avatar';
import { Button } from '../../src/components/common/Button';
import { referralsApi } from '../../src/services/api';
import { router } from 'expo-router';
import type { ReferrerInboxItem, ReferralStatus } from '@refr/shared';

type ActiveStatus = 'accepted' | 'submitted' | 'interviewing';
const ACTIVE_STATUSES: ActiveStatus[] = ['accepted', 'submitted', 'interviewing'];

const STATUS_LABELS: Record<ActiveStatus, string> = {
  accepted: 'Accepted',
  submitted: 'Submitted to HR',
  interviewing: 'Interviewing',
};

const STATUS_COLORS: Record<ActiveStatus, string> = {
  accepted: colors.pipelineAccepted,
  submitted: colors.pipelineSubmitted,
  interviewing: colors.pipelineInterviewing,
};

export default function ActiveRoute() {
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await referralsApi.getInbox();
      setItems(
        data.filter((item) =>
          ACTIVE_STATUSES.includes(item.referral.status as ActiveStatus),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const transitionItem = useCallback(
    async (id: string, next: ReferralStatus, successMessage: string) => {
      setPendingId(id);
      try {
        const updated = await referralsApi.transition(id, next);
        const stillActive = ACTIVE_STATUSES.includes(updated.status as ActiveStatus);
        setItems((prev) =>
          stillActive
            ? prev.map((item) =>
                item.referral.id === id
                  ? { ...item, referral: updated }
                  : item,
              )
            : prev.filter((item) => item.referral.id !== id),
        );
        Alert.alert('Updated', successMessage);
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

  const confirmSubmit = (item: ReferrerInboxItem) => {
    Alert.alert(
      `Submit ${item.seekerName} to HR?`,
      'This marks the referral as formally submitted to the company. The seeker will see it move forward on their pipeline.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () =>
            transitionItem(
              item.referral.id,
              'submitted',
              `${item.seekerName} marked as submitted.`,
            ),
        },
      ],
    );
  };

  const confirmInterviewing = (item: ReferrerInboxItem) => {
    Alert.alert(
      'Move to Interviewing?',
      'Confirms the seeker has started interviews.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () =>
            transitionItem(
              item.referral.id,
              'interviewing',
              `${item.seekerName} is now interviewing.`,
            ),
        },
      ],
    );
  };

  const confirmOutcome = (item: ReferrerInboxItem) => {
    Alert.alert(
      'Mark outcome',
      `What was the outcome for ${item.seekerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rejected',
          style: 'destructive',
          onPress: () =>
            transitionItem(
              item.referral.id,
              'rejected',
              'Outcome recorded. Score unchanged.',
            ),
        },
        {
          text: 'Hired  +10',
          onPress: () =>
            transitionItem(
              item.referral.id,
              'hired',
              `${item.seekerName} hired. Kingmaker +10.`,
            ),
        },
      ],
    );
  };

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
          <Text style={styles.title}>Active Referrals</Text>
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
        <Text style={styles.title}>Active Referrals</Text>
        <Text style={styles.subtitle}>
          {items.length} in progress
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No active referrals</Text>
          <Text style={styles.emptyBody}>
            Accept requests from your inbox to start the referral process.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.referral.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={load}
          refreshing={loading}
          renderItem={({ item }) => (
            <ActiveCard
              item={item}
              pending={pendingId === item.referral.id}
              onSubmit={() => confirmSubmit(item)}
              onInterviewing={() => confirmInterviewing(item)}
              onOutcome={() => confirmOutcome(item)}
              onChat={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    referralId: item.referral.id,
                    participantName: item.seekerName,
                    participantAvatar: item.seekerAvatar,
                  },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ActiveCard({
  item,
  pending,
  onSubmit,
  onInterviewing,
  onOutcome,
  onChat,
}: {
  item: ReferrerInboxItem;
  pending: boolean;
  onSubmit: () => void;
  onInterviewing: () => void;
  onOutcome: () => void;
  onChat: () => void;
}) {
  const status = item.referral.status as ActiveStatus;
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  const primaryAction = (() => {
    switch (status) {
      case 'accepted':
        return { label: 'Submit to HR', onPress: onSubmit };
      case 'submitted':
        return { label: 'Mark Interviewing', onPress: onInterviewing };
      case 'interviewing':
        return { label: 'Record Outcome', onPress: onOutcome };
      default:
        return null;
    }
  })();

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Avatar uri={item.seekerAvatar} displayName={item.seekerName} size="md" />
        <View style={styles.cardMeta}>
          <Text style={styles.seekerName}>{item.seekerName}</Text>
          <Text style={styles.seekerHeadline} numberOfLines={1}>
            {item.seekerHeadline}
          </Text>
          <Text style={styles.targetRole}>{item.referral.targetRole}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {primaryAction && (
          <Button
            label={pending ? 'Updating...' : primaryAction.label}
            onPress={primaryAction.onPress}
            variant="primary"
            size="medium"
            disabled={pending}
            style={styles.primaryBtn}
          />
        )}
        <Button
          label="Chat"
          onPress={onChat}
          variant="secondary"
          size="medium"
          style={styles.chatBtn}
        />
      </View>
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
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  list: { padding: layout.screenPaddingH, gap: spacing[4], paddingBottom: spacing[20] },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptyBody: { ...typography.body, color: colors.textTertiary, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: layout.cardBorderRadius,
    padding: layout.cardPadding,
    gap: spacing[3],
  },
  cardRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  cardMeta: { flex: 1, gap: spacing[0.5] },
  seekerName: { ...typography.bodyLarge, color: colors.text, fontFamily: 'Outfit-SemiBold' },
  seekerHeadline: { ...typography.bodySmall, color: colors.textSecondary },
  targetRole: { ...typography.caption, color: colors.accent, marginTop: spacing[1] },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
    borderRadius: 100,
  },
  statusText: { ...typography.caption, fontFamily: 'Outfit-SemiBold' },
  actionRow: { flexDirection: 'row', gap: spacing[2] },
  primaryBtn: { flex: 2 },
  chatBtn: { flex: 1 },
});
