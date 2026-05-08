import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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
import { AmbientBackground } from '../components/common/AmbientBackground';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem } from '@refr/shared';
import { PipelineStepper, type PipelineStage } from '../components/activity/PipelineStepper';

const STATUS_LABELS: Record<string, string> = {
  requested: 'Waiting',
  accepted: 'Accepted',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  requested: colors.pipelineRequested,
  accepted: colors.pipelineAccepted,
  submitted: colors.pipelineSubmitted,
  interviewing: colors.pipelineInterviewing,
  hired: colors.pipelineHired,
  rejected: colors.pipelineRejected,
  withdrawn: colors.pipelineWithdrawn,
  expired: colors.pipelineExpired,
};

export function PipelineScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <AmbientBackground />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>
            {items.length} endorsement{items.length !== 1 ? 's' : ''} in flight
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyBody}>
              Swipe right on an Endorser in Discover to request your first endorsement.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
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

function PipelineItem({ item }: { item: SeekerPipelineItem }) {
  const statusColor = STATUS_COLORS[item.referral.status] ?? colors.textTertiary;
  const statusLabel = STATUS_LABELS[item.referral.status] ?? item.referral.status;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.companyRow}>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.role}>{item.referral.targetRole}</Text>
      </View>

      <View style={styles.referrerRow}>
        <Text style={styles.referrerLabel}>Referrer</Text>
        <Text style={styles.referrerName}>{item.referrerName}</Text>
      </View>

      <PipelineStepper stage={item.referral.status as PipelineStage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
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
  card: {
    backgroundColor: colors.surfaceLevel2,
    borderRadius: layout.cardBorderRadius,
    padding: layout.cardPadding,
    gap: spacing[4],
  },
  cardTop: { gap: spacing[1] },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyName: { ...typography.h4, color: colors.text },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
    borderRadius: 100,
  },
  statusText: { ...typography.caption, fontFamily: 'Outfit-SemiBold' },
  role: { ...typography.body, color: colors.textSecondary },
  referrerRow: { gap: spacing[0.5] },
  referrerLabel: { ...typography.caption, color: colors.textTertiary },
  referrerName: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: 'Outfit-SemiBold',
  },
});
