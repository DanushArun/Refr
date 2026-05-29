import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { router } from 'expo-router';
import { Phrase } from '../utils/haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { latestStageTimestamp } from '../components/activity/referralCardShared';
import { MatchInboxRow } from '../components/matches/MatchInboxRow';
import { NewMatchesCarousel } from '../components/matches/NewMatchesCarousel';
import { RestingSection } from '../components/matches/RestingSection';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';
import { useWarmTabData } from '../hooks/useWarmTabData';
import {
  partitionMatches,
  relativeLabel,
} from '../components/matches/matchTiering';
import { referralsApi } from '../services/api';
import type {
  ReferralStatus,
  ReferrerInboxItem,
  SeekerPipelineItem,
} from '@refr/shared';

/**
 * Endorser Inbox — the referrer's chat surface.
 *
 * Mirror of the seeker's MatchesScreen, but built around the referrer's
 * incoming queue (`ReferrerInboxItem`) instead of the seeker's pipeline.
 * Same three tiers, same chip language, same tiering rules:
 *
 *   1. Fresh    — recently-accepted candidates the referrer hasn't messaged
 *                 yet. The "go say hi" prompt.
 *   2. Active   — ongoing chats with candidates being shepherded.
 *   3. Resting  — terminal (hired/rejected/withdrawn/expired) or 30+ days
 *                 idle. Collapsed by default. History preserved.
 *
 * The referrer's "Active" tab tracks pipeline state + actions per candidate;
 * THIS screen is the conversation-only view. Two surfaces, two jobs:
 *
 *   - Active: "what do I need to DO with this candidate, and what's the payout?"
 *   - Inbox:  "who am I talking to, and who needs a reply?"
 *
 * Why we adapt to SeekerPipelineItem at the boundary: the matches
 * components (carousel, row, tiering) are written against
 * SeekerPipelineItem because that's where they were born. The endorser's
 * data has the same shape semantically — referral object + the other
 * party's name — so a small adapter keeps the components shared instead of
 * duplicating them. If/when more endorser-specific fields are needed
 * (incoming match score, candidate headline preview), generalize the
 * components further; for now adaptation is the right cost.
 */

const ACTIVE_FOR_INBOX: ReadonlySet<ReferralStatus> = new Set<ReferralStatus>([
  'requested',
  'accepted',
  'submitted',
  'interviewing',
  'hired',
  'rejected',
  'withdrawn',
  'expired',
]);

/**
 * Tab-local stage-filter taxonomy. The endorser cares about a different
 * stage subset than the seeker's Matches: the endorser may want to see
 * who's specifically waiting at "Requested" (needs response) vs.
 * "Submitted" (waiting on HR) etc. We expose all in-flight stages.
 */
type StageFilter = 'all' | 'requested' | 'submitted' | 'interviewing';

const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'New' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
];

const STAGE_LABEL: Record<StageFilter, string> = {
  all: 'All',
  requested: 'New',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
};

function bucketFor(status: ReferralStatus): Exclude<StageFilter, 'all'> | null {
  switch (status) {
    case 'requested':
    case 'accepted':
      return 'requested';
    case 'submitted':
      return 'submitted';
    case 'interviewing':
      return 'interviewing';
    default:
      return null; // hired / rejected / withdrawn / expired — terminal
  }
}

function filterByStage(
  items: ReferrerInboxItem[],
  filter: StageFilter,
): ReferrerInboxItem[] {
  if (filter === 'all') return items;
  return items.filter((it) => bucketFor(it.referral.status) === filter);
}

function buildStageCounts(
  items: ReferrerInboxItem[],
): Record<Exclude<StageFilter, 'all'>, number> {
  const out = { requested: 0, submitted: 0, interviewing: 0 };
  for (const it of items) {
    const b = bucketFor(it.referral.status);
    if (b) out[b] += 1;
  }
  return out;
}

/**
 * Adapt a `ReferrerInboxItem` to the `SeekerPipelineItem` shape that the
 * shared matches components consume. The other-party's name moves into
 * `referrerName` (read it as "the participant's name" — the field is
 * generic by usage even if the type field name is seeker-side).
 *
 * Company comes from the referrer's profile in real life; for the demo we
 * use the first known referrer company so cards have something to render.
 * Once the API exposes the referrer's profile alongside inbox items, this
 * defaults to that.
 */
const REFERRER_COMPANY = 'Razorpay';

function adapt(item: ReferrerInboxItem): SeekerPipelineItem {
  return {
    referral: item.referral,
    referrerName: item.seekerName,
    companyName: REFERRER_COMPANY,
  };
}

export function EndorserInboxScreen() {
  const hasLoadedRef = useRef(false);
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

  const load = useCallback(async () => {
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const data = await referralsApi.getInbox();
      setItems(data.filter((i) => ACTIVE_FOR_INBOX.has(i.referral.status)));
      hasLoadedRef.current = true;
    } catch {
      Alert.alert('Error', 'Failed to load inbox');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useWarmTabData(load);

  const onRefresh = useCallback(() => {
    Phrase.pullRefresh();
    setRefreshing(true);
    load();
  }, [load]);

  // Filter then adapt — partitioning consumes the seeker-pipeline shape.
  // Resting is computed off the unfiltered set so the ledger keeps its full
  // history count regardless of the active stage chip.
  const filteredItems = useMemo(
    () => filterByStage(items, stageFilter),
    [items, stageFilter],
  );
  const liveTiers = useMemo(
    () => partitionMatches(filteredItems.map(adapt)),
    [filteredItems],
  );
  const restingAll = useMemo(
    () => partitionMatches(items.map(adapt)).resting,
    [items],
  );

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
    // We need the original ReferrerInboxItem to pull avatar + headline;
    // resolve it by id. Falls back gracefully if the item isn't there
    // (shouldn't happen in practice — both lists are derived from `items`).
    const source = items.find((i) => i.referral.id === item.referral.id);
    router.push({
      pathname: '/chat',
      params: {
        referralId: item.referral.id,
        participantName: item.referrerName,
        participantAvatar: source?.seekerAvatar ?? '',
        participantSubtitle: source?.seekerHeadline,
        targetRole: item.referral.targetRole,
        companyName: item.companyName,
        stage: item.referral.status,
      },
    });
  }, [items]);

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
  const activeCount = liveTiers.active.length;
  const filtering = stageFilter !== 'all';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>
            {total === 0
              ? 'No conversations yet'
              : filtering
              ? `${activeCount} ${STAGE_LABEL[stageFilter].toLowerCase()}`
              : `${activeCount} live${
                  restingAll.length > 0 ? ` · ${restingAll.length} resting` : ''
                }`}
          </Text>
        </View>

        {total > 0 && (
          <FilterBar
            options={filterOptions}
            current={stageFilter}
            onChange={onPickStage}
            ariaLabel="Inbox stage filter"
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
            {/* Tier 1 — Fresh (only when not filtering) */}
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
                  <Text style={styles.sectionCount}>
                    {liveTiers.active.length}
                  </Text>
                  <Text style={styles.sectionHint}>
                    {filtering ? 'matching' : 'live'}
                  </Text>
                </View>
                <View style={styles.activeStack}>
                  {liveTiers.active.map((item) => {
                    const ts = latestStageTimestamp(item.referral);
                    const source = items.find(
                      (i) => i.referral.id === item.referral.id,
                    );
                    return (
                      <MatchInboxRow
                        key={item.referral.id}
                        data={{
                          id: item.referral.id,
                          participantName: item.referrerName,
                          participantAvatar: source?.seekerAvatar,
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
            ) : (
              filtering && (
                <View style={styles.filteredEmpty}>
                  <Text style={styles.filteredEmptyText}>
                    Nothing in {STAGE_LABEL[stageFilter].toLowerCase()} right now.
                  </Text>
                </View>
              )
            )}

            {/* Tier 3 — Resting */}
            <RestingSection items={restingAll} onOpen={openChat} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="mail-outline" size={32} color={colors.accent} />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptyBody}>
        Accept a candidate in Discover and they'll appear here. New chats
        light up with a gold rim.
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
    paddingBottom: 116,
    gap: spacing[5],
  },

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
