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
import { Phrase } from '../utils/haptics';
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
    Phrase.pullRefresh();
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
  // Fresh is a subset of active now (every fresh match is also in active),
  // so the live count is just `active.length` — no addition.
  const activeCount = tiers.active.length;

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

            {/* Tier 2 — Active conversations. Each row is its own pill
                (not a unified slab) with 8px gap between them. The shape
                difference between Tier 2 (pills with stage rails) and Tier
                3 (compact ledger entries) is the design call: each tier is
                a distinct artefact, not the same shape repeated. */}
            {tiers.active.length > 0 && (
              <View style={styles.activeWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Conversations</Text>
                  <Text style={styles.sectionCount}>{tiers.active.length}</Text>
                  <Text style={styles.sectionHint}>live</Text>
                </View>
                <View style={styles.activeStack}>
                  {tiers.active.map((item) => {
                    const ts = latestStageTimestamp(item.referral);
                    return (
                      <MatchInboxRow
                        key={item.referral.id}
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
                    );
                  })}
                </View>
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

  /* Tier 2 — stack of independent pills with breathing room between. Each
     pill owns its own surface + rim, so the eye reads them as discrete
     conversations, not a homogenised inbox. */
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
  /* Sub-label echoes the resting "ledger / resting" pattern so both tier
     headers share a typographic rhythm. */
  sectionHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: 'rgba(250, 250, 247, 0.32)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  activeStack: {
    gap: 8,
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
