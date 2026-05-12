import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
import { Skeleton } from '../components/common/Skeleton';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';
import { NewMatchesCarousel } from '../components/matches/NewMatchesCarousel';
import { RestingSection } from '../components/matches/RestingSection';
import {
  partitionMatches,
  relativeLabel,
} from '../components/matches/matchTiering';
import { referralsApi } from '../services/api';
import type { ReferralStatus, SeekerPipelineItem } from '@refr/shared';

/**
 * Matches inbox — the seeker's social surface.
 *
 * Three placements:
 *
 *   1. Fresh    — recently-accepted endorsers (≤ 7 days). Horizontal
 *                 carousel up top; the "go say hi" prompt. Same matches are
 *                 *also* in Conversations below — the carousel is a
 *                 spotlight, not a hide-from-list.
 *   2. Active   — ongoing conversations. Compact pill rows with stage
 *                 rails; the daily-scan surface.
 *   3. Resting  — terminal or stale (30+ days) matches. Collapsed by
 *                 default. Never deleted; this is how we keep history
 *                 without crowding the live surface.
 *
 * Filter strip — bespoke to the inbox: stage filters (Matched / Submitted /
 * Interviewing). Discovery's filter is by company because Discovery's job
 * is "which company should I get endorsed at?". Matches' job is "where am
 * I with each person?" — stage is the right axis here.
 */
export function MatchesScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

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

  // Apply the stage filter BEFORE partitioning so each tier's count + the
  // per-tier list reflect the user's chosen lens. Resting is always
  // computed off the unfiltered items so the ledger keeps its full history
  // count regardless of the active stage chip.
  const filteredItems = useMemo(
    () => filterByStage(items, stageFilter),
    [items, stageFilter],
  );
  const liveTiers = useMemo(() => partitionMatches(filteredItems), [filteredItems]);
  const restingAll = useMemo(() => partitionMatches(items).resting, [items]);

  // Per-stage counts for the chip badges — calculated against the full
  // (non-resting) live set so chip counts don't re-shuffle as the user
  // toggles between filters.
  const stageCounts = useMemo(() => buildStageCounts(items), [items]);

  const onPickStage = useCallback((next: StageFilter) => {
    setStageFilter(next);
  }, []);

  const filterOptions = useMemo<readonly FilterOption<StageFilter>[]>(
    () =>
      STAGE_FILTERS.map((opt) => ({
        ...opt,
        count: opt.key === 'all' ? items.length : stageCounts[opt.key],
      })),
    [stageCounts, items.length],
  );

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

  /**
   * Per-item bound press handlers, memoized by the items array. Without
   * this, each `() => openChat(item)` arrow inside the map() would be a
   * fresh function reference on every parent render — defeating the
   * React.memo equality check on each row. We rebuild the map only when the
   * items array itself changes.
   */
  const itemPressHandlers = useMemo(() => {
    const map = new Map<string, () => void>();
    for (const it of items) {
      map.set(it.referral.id, () => openChat(it));
    }
    return map;
  }, [items, openChat]);

  if (loading) {
    // Skeleton placeholder mirrors the 3-tier shape: title + caption,
    // the fresh carousel as a row of avatar circles, then a stack of
    // active-row pills. Layout doesn't jump when the API resolves.
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text style={styles.title}>Matches</Text>
            <Skeleton width={120} height={14} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.scroll}>
            <View style={styles.skelCarousel}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.skelTile}>
                  <Skeleton width={56} height={56} radius={28} />
                  <Skeleton width={56} height={11} style={{ marginTop: 8 }} />
                  <Skeleton width={40} height={9} style={{ marginTop: 4 }} />
                </View>
              ))}
            </View>
            <View style={styles.skelActiveStack}>
              {Array.from({ length: 4 }).map((_, i) => (
                <MatchSkeletonRow key={i} />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const total = items.length;
  const activeCount = liveTiers.active.length;
  const filtering = stageFilter !== 'all';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.subtitle}>
            {total === 0
              ? 'No matches yet'
              : filtering
              ? `${activeCount} ${STAGE_LABEL[stageFilter].toLowerCase()}`
              : `${activeCount} live${
                  restingAll.length > 0 ? ` · ${restingAll.length} resting` : ''
                }`}
          </Text>
        </View>

        {/* Stage filter strip — Matched / Submitted / Interviewing.
            Hidden when there are no matches at all. Uses the shared
            FilterBar so visual + interaction are identical to Pipeline,
            Inbox, Active, and Discover. */}
        {total > 0 && (
          <FilterBar
            options={filterOptions}
            current={stageFilter}
            onChange={onPickStage}
            ariaLabel="Match stage filter"
          />
        )}

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
            {/* Tier 1 — Fresh. Hidden when filtering by a stage other than
                'all' (the carousel is the recency surface; if you've narrowed
                to a stage, give the conversation list the spotlight). */}
            {!filtering && (
              <NewMatchesCarousel items={liveTiers.fresh} onPick={openChat} />
            )}

            {/* Tier 2 — Active conversations */}
            {liveTiers.active.length > 0 ? (
              <View style={styles.activeWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {filtering ? STAGE_LABEL[stageFilter] : 'Conversations'}
                  </Text>
                  <Text style={styles.sectionCount}>{liveTiers.active.length}</Text>
                  <Text style={styles.sectionHint}>
                    {filtering ? 'matching' : 'live'}
                  </Text>
                </View>
                <View style={styles.activeStack}>
                  {liveTiers.active.map((item) => {
                    const ts = latestStageTimestamp(item.referral);
                    return (
                      <MatchInboxRow
                        key={item.referral.id}
                        data={{
                          id: item.referral.id,
                          participantName: item.referrerName,
                          companyName: item.companyName,
                          role: item.referral.targetRole,
                          status: item.referral.status,
                          stageTimestamp: ts,
                        }}
                        onPress={itemPressHandlers.get(item.referral.id) ?? (() => openChat(item))}
                        timeLabel={relativeLabel(ts)}
                      />
                    );
                  })}
                </View>
              </View>
            ) : (
              filtering && (
                <View style={styles.filteredEmpty}>
                  <Text style={styles.filteredEmptyText}>
                    Nothing in {STAGE_LABEL[stageFilter].toLowerCase()} right now.
                  </Text>
                </View>
              )
            )}

            {/* Tier 3 — Resting. Always shown (when present); the ledger is
                history regardless of which live stage you're filtering. */}
            <RestingSection items={restingAll} onOpen={openChat} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─────────── stage filters ───────────

type StageFilter = 'all' | 'matched' | 'submitted' | 'interviewing';

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
];

const STAGE_LABEL: Record<StageFilter, string> = {
  all: 'All',
  matched: 'Matched',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
};

/** Map a referral status to the filter bucket it belongs to. `requested`
 *  and `accepted` both fall under "matched" — same as the stage rail. */
function bucketFor(status: ReferralStatus): Exclude<StageFilter, 'all'> | null {
  switch (status) {
    case 'requested':
    case 'accepted':
      return 'matched';
    case 'submitted':
      return 'submitted';
    case 'interviewing':
      return 'interviewing';
    default:
      return null; // hired / rejected / withdrawn / expired — terminal
  }
}

function filterByStage(
  items: SeekerPipelineItem[],
  filter: StageFilter,
): SeekerPipelineItem[] {
  if (filter === 'all') return items;
  return items.filter((it) => bucketFor(it.referral.status) === filter);
}

function buildStageCounts(
  items: SeekerPipelineItem[],
): Record<Exclude<StageFilter, 'all'>, number> {
  const out = { matched: 0, submitted: 0, interviewing: 0 };
  for (const it of items) {
    const b = bucketFor(it.referral.status);
    if (b) out[b] += 1;
  }
  return out;
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

/** Skeleton match row — same overall silhouette as MatchInboxRow. */
function MatchSkeletonRow() {
  return (
    <View style={styles.skelRow}>
      <Skeleton width={4} height={36} radius={2} />
      <Skeleton width={44} height={44} radius={22} />
      <View style={styles.skelRowMiddle}>
        <Skeleton width={140} height={14} />
        <Skeleton width={180} height={11} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={28} height={11} />
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

  /* Skeleton — fresh-tier carousel placeholder */
  skelCarousel: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  skelTile: {
    alignItems: 'center',
    width: 76,
  },
  skelActiveStack: {
    gap: 8,
    marginTop: spacing[3],
  },
  skelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  skelRowMiddle: {
    flex: 1,
  },

  /* Tier 2 — stack of independent pills with breathing room between. */
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
  sectionHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: 'rgba(250, 250, 247, 0.32)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  activeStack: { gap: 8 },

  /* Inline empty state when the active filter narrows to nothing. Reads
     like a quiet log line, not a marquee — just enough to tell the user
     why their list is short. */
  filteredEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  filteredEmptyText: {
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
