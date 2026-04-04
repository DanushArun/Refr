import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';
import { Avatar } from '../../src/components/common/Avatar';
import { Button } from '../../src/components/common/Button';
import { referralsApi } from '../../src/services/api';
import { router } from 'expo-router';
import type { ReferrerInboxItem } from '@refr/shared';

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Accepted',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
};

const STATUS_COLORS: Record<string, string> = {
  accepted: colors.pipelineAccepted,
  submitted: colors.pipelineSubmitted,
  interviewing: colors.pipelineInterviewing,
};

export default function ActiveRoute() {
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralsApi.getInbox()
      .then((data: ReferrerInboxItem[]) => {
        const active = data.filter((item: ReferrerInboxItem) =>
          ['accepted', 'submitted', 'interviewing'].includes(item.referral.status)
        );
        setItems(active);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
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
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.referral.status] ?? colors.textTertiary;
            const statusLabel = STATUS_LABELS[item.referral.status] ?? item.referral.status;

            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Avatar uri={item.seekerAvatar} displayName={item.seekerName} size="md" />
                  <View style={styles.cardMeta}>
                    <Text style={styles.seekerName}>{item.seekerName}</Text>
                    <Text style={styles.seekerHeadline} numberOfLines={1}>{item.seekerHeadline}</Text>
                    <Text style={styles.targetRole}>{item.referral.targetRole}</Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>

                <Button
                  label="Open chat"
                  onPress={() => router.push({
                    pathname: '/chat',
                    params: {
                      referralId: item.referral.id,
                      participantName: item.seekerName,
                      participantAvatar: item.seekerAvatar,
                    },
                  })}
                  variant="secondary"
                  size="medium"
                  fullWidth
                />
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
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
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
  },
  statusText: { ...typography.caption, fontFamily: 'Outfit-SemiBold' },
});
