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
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { router } from 'expo-router';
import { referralsApi } from '../services/api';

/**
 * MatchesScreen — seeker's view of accepted referrals.
 *
 * Only shows referrals where status is accepted/submitted/interviewing.
 * Each row shows the referrer + company + chat CTA.
 */
export function MatchesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralsApi.getPipeline()
      .then((data: any[]) => {
        const active = data.filter((r: any) =>
          ['accepted', 'submitted', 'interviewing'].includes(r.status)
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
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>
          {items.length} active referral{items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyBody}>
            Once a referrer accepts your request, they'll appear here and you can chat.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/Chat',
                  params: {
                    referralId: item.id,
                    participantName: item.referrer?.user?.displayName ?? 'Referrer',
                    participantAvatar: item.referrer?.user?.avatarUrl,
                  }
                })
              }
            >
              <Avatar
                uri={item.referrer?.user?.avatarUrl}
                displayName={item.referrer?.user?.displayName ?? '?'}
                size="md"
              />
              <View style={styles.cardMeta}>
                <Text style={styles.referrerName}>
                  {item.referrer?.user?.displayName}
                </Text>
                <Text style={styles.referrerTitle}>
                  {item.referrer?.jobTitle} at {item.company?.name}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.chatArrow}>→</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    accepted: colors.pipelineAccepted,
    submitted: colors.pipelineSubmitted,
    interviewing: colors.pipelineInterviewing,
  };
  return map[status] ?? colors.textTertiary;
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
  list: { paddingHorizontal: layout.screenPaddingH, gap: spacing[3], paddingBottom: spacing[20] },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
  },
  cardMeta: { flex: 1, gap: spacing[0.5] },
  referrerName: { ...typography.body, color: colors.text, fontFamily: 'Outfit-SemiBold' },
  referrerTitle: { ...typography.caption, color: colors.textSecondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], marginTop: spacing[1] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typography.caption, color: colors.textTertiary, textTransform: 'capitalize' },
  chatArrow: { fontSize: 20, color: colors.textTertiary },
});
