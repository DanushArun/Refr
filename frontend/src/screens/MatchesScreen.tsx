import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { router } from 'expo-router';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem } from '@refr/shared';

/**
 * MatchesScreen -- seeker's view of accepted referrals.
 *
 * Only shows referrals where status is accepted/submitted/interviewing.
 * Each row shows the referrer + company + chat CTA.
 */
export function MatchesScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralsApi.getPipeline()
      .then((data: SeekerPipelineItem[]) => {
        const active = data.filter((item: SeekerPipelineItem) =>
          ['accepted', 'submitted', 'interviewing'].includes(item.referral.status)
        );
        setItems(active);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load matches');
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
          keyExtractor={(item) => item.referral.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    referralId: item.referral.id,
                    participantName: item.referrerName,
                    participantAvatar: '',
                  }
                })
              }
            >
              <Avatar
                displayName={item.referrerName}
                size="md"
              />
              <View style={styles.cardMeta}>
                <Text style={styles.referrerName}>
                  {item.referrerName}
                </Text>
                <Text style={styles.referrerTitle}>
                  {item.referral.targetRole} at {item.companyName}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.referral.status) }]} />
                  <Text style={styles.statusText}>{item.referral.status}</Text>
                </View>
              </View>
              <Text style={styles.chatArrow}>&#8594;</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: layout.cardBorderRadius,
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
