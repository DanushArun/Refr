import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { latestStageTimestamp } from '../components/activity/referralCardShared';
import { MatchInboxRow } from '../components/matches/MatchInboxRow';
import { NewMatchesCarousel } from '../components/matches/NewMatchesCarousel';
import { RestingSection } from '../components/matches/RestingSection';
import {
  partitionMatches,
  relativeLabel,
} from '../components/matches/matchTiering';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem } from '@refr/shared';

/**
 * Matches inbox — the seeker's social surface.
 *
 * Three tiers, optimised for the daily-scan job:
 *
 *   1. Fresh    — recently-accepted endorsers, conversation hasn't started.
 *                 Horizontal avatar carousel; the "go say hi" prompt.
 *   2. Active   — ongoing conversations. Compact ~72px rows in a single
 *                 cream surface, hairline-divided. Ordered by recency.
 *   3. Resting  — terminal or stale (30+ days) matches. Collapsed by
 *                 default, expandable. We never delete user history; this is
 *                 how we keep it without crowding the active surface.
 *
 * Why this shape, in short: Activity is the "where each job stands" tab —
 * tall journey cards make sense there. Matches is the "who am I talking to"
 * tab — high-frequency, scannable, scales to many entries. Card-stack for
 * Activity, list-with-tiers for Matches.
 */
export function MatchesScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await referralsApi.getPipeline();
      setItems(data as SeekerPipelineItem[]);
    } catch {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const tiers = useMemo(() => partitionMatches(items), [items]);

  const openChat = useCallback((item: SeekerPipelineItem) => {
    router.push({
      pathname: '/chat',
      params: {
        referralId: item.referral.id,
        participantName: item.referrerName,
        participantAvatar: '',
        targetRole: item.referral.targetRole,
        companyName: item.companyName,
        stage: item.referral.status,
      },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  const total = items.length;
  const activeCount = tiers.active.length + tiers.fresh.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.subtitle}>
            {total === 0
              ? 'No matches yet'
              : `${activeCount} live${
                  tiers.resting.length > 0
                    ? ` · ${tiers.resting.length} resting`
                    : ''
                }`}
          </Text>
        </View>

        {total === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
          >
            {/* Tier 1 — Fresh */}
            <NewMatchesCarousel items={tiers.fresh} onPick={openChat} />

            {/* Tier 2 — Active conversations */}
            {tiers.active.length > 0 && (
              <View style={styles.activeWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Conversations</Text>
                  <Text style={styles.sectionCount}>{tiers.active.length}</Text>
                </View>
                <View style={styles.activeList}>
                  {tiers.active.map((item, i) => {
                    const ts = latestStageTimestamp(item.referral);
                    return (
                      <View key={item.referral.id}>
                        {i > 0 && <View style={styles.divider} />}
                        <MatchInboxRow
                          data={{
                            id: item.referral.id,
                            endorserName: item.referrerName,
                            companyName: item.companyName,
                            role: item.referral.targetRole,
                            status: item.referral.status,
                            stageTimestamp: ts,
                          }}
                          onPress={() => openChat(item)}
                          timeLabel={relativeLabel(ts)}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Tier 2 empty-but-fresh-only state — gives the carousel room
                to breathe and tells the user what to do next. */}
            {tiers.active.length === 0 && tiers.fresh.length > 0 && (
              <View style={styles.activeEmpty}>
                <Text style={styles.activeEmptyText}>
                  Tap one of your new matches above to start the conversation.
                </Text>
              </View>
            )}

            {/* Tier 3 — Resting */}
            <RestingSection items={tiers.resting} onOpen={openChat} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="compass-outline" size={32} color={colors.accent} />
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptyBody}>
        Once a referrer accepts your request, they'll appear here and you can chat.
      </Text>
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
  subtitle: { ...typography.caption, color: colors.textSecondary },
  scroll: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[2],
    // Tab bar = 70px tall + 26px bottom inset + breathing room
    paddingBottom: 116,
    gap: spacing[5],
  },

  /* Tier 2 — single dark-glass surface housing all active conversation
     rows. One translucent slab with a hairline gold rim + hairline dividers
     between rows. Reads as frosted glass on navy, not the cream slab from
     Activity, so Matches has its own design language. */
  activeWrap: { gap: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: colors.textTertiary,
  },
  activeList: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: layout.cardBorderRadiusLarge,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.18)',
    overflow: 'hidden',
  },
  /* Hairline divider between rows — light enough to read as a beat, not
     a wall. Inset past the avatar so the eye flows through names. */
  divider: {
    height: 1,
    marginLeft: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  activeEmptyText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  /* Universal empty state — only shown when the entire pipeline is empty. */
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
    gap: spacing[3],
  },
  emptyTitle: { ...typography.h4, color: colors.text },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
