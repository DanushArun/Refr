import React, { useCallback, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReferralStatus, ReferrerInboxItem } from '@refr/shared';
import { Button } from '../components/common/Button';
import { EndorserVoyageCard } from '../components/activity/EndorserVoyageCard';
import { FilterBar, type FilterOption } from '../components/common/FilterBar';
import { latestStageTimestamp } from '../components/activity/referralCardShared';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { playSensoryEvent } from '../utils/haptics';
import { navigateAfterPress } from '../utils/navigationAfterPress';
import { useWarmTabData } from '../hooks/useWarmTabData';
import { DEMO_PAYOUT_PER_HIRE, getCurrentDemoCompanyName } from '../config/demoWorld';
import { activeStyles as styles } from './active/activeStyles';
import { NoticePill } from './active/ActiveSummary';
import { EmptyState, ErrorState, LoadingState } from './active/ActiveStates';
import {
  ACTIVE_STAGE_FILTERS,
  type ActiveStageFilter,
  countActiveStages,
  filterActiveItems,
  sortActiveItems,
} from '../lib/activity/activeFilters';

export function ActiveScreen() {
  const isFocused = useIsFocused();
  const hasLoadedRef = useRef(false);
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<ActiveStageFilter>('all');
  const [companyName, setCompanyName] = useState(getCurrentDemoCompanyName());

  const load = useCallback(async (mode: 'focus' | 'refresh' | 'retry' = 'focus') => {
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'retry' || !hasLoadedRef.current) setLoading(true);
    setError(null);
    try {
      const [inbox, reputation] = await Promise.all([
        referralsApi.getInbox(),
        referralsApi.getReputation(),
      ]);
      setItems(filterActiveItems(inbox, 'all'));
      setCompanyName(reputation.company?.name ?? getCurrentDemoCompanyName());
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useWarmTabData(load);

  const sortedItems = useMemo(() => {
    return sortActiveItems(filterActiveItems(items, stageFilter));
  }, [items, stageFilter]);

  const stageCounts = useMemo(() => countActiveStages(items), [items]);
  const filterOptions = useMemo<readonly FilterOption<ActiveStageFilter>[]>(
    () =>
      ACTIVE_STAGE_FILTERS.map((opt) => ({
        ...opt,
        count: opt.key === 'all' ? items.length : stageCounts[opt.key],
      })),
    [stageCounts, items.length],
  );

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        hiredThisMonth: acc.hiredThisMonth + Number(wasHiredThisMonth(item)),
        inFlightCount: acc.inFlightCount + Number(item.referral.status !== 'hired'),
      }),
      { hiredThisMonth: 0, inFlightCount: 0 },
    );
  }, [items]);

  const transition = useCallback(
    async (id: string, next: ReferralStatus, message: string) => {
      setPendingId(id);
      setNotice(null);
      try {
        const updated = await referralsApi.transition(id, next);
        setItems((prev) =>
          filterActiveItems(
            prev.map((item) => (item.referral.id === id ? { ...item, referral: updated } : item)),
            'all',
          ),
        );
        setNotice(message);
        void playSensoryEvent(next === 'hired' ? 'hire.confirmed' : 'pipeline.advance');
      } catch (err) {
        void playSensoryEvent('failure.rollback');
        Alert.alert('Could not update', err instanceof Error ? err.message : 'Please try again.');
      } finally {
        setPendingId(null);
      }
    },
    [],
  );

  const handleAction = useCallback(
    (item: ReferrerInboxItem, kind: 'submit' | 'interviewing' | 'outcome' | 'view') => {
      handleCardAction({ item, kind, transition });
    },
    [transition],
  );

  const handleChat = useCallback(
    (item: ReferrerInboxItem) => {
      navigateAfterPress(() => {
        router.push({
          pathname: '/chat',
          params: {
            referralId: item.referral.id,
            participantName: item.seekerName,
            participantAvatar: item.seekerAvatar,
            participantSubtitle: item.seekerHeadline,
            targetRole: item.referral.targetRole,
            companyName,
            stage: item.referral.status,
          },
        });
      });
    },
    [companyName],
  );

  const openDiscover = useCallback(() => {
    navigateAfterPress(() => router.push('/(referrer-tabs)/discover'));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Pipeline</Text>
        <Text style={styles.subtitle}>
          {summary.inFlightCount} in flight · {summary.hiredThisMonth} hired this month
        </Text>
      </View>

      {items.length > 0 && (
        <FilterBar
          options={filterOptions}
          current={stageFilter}
          onChange={setStageFilter}
          ariaLabel="Pipeline stage filter"
        />
      )}

      <ActiveList
        items={sortedItems}
        emptyTitle={items.length === 0 ? 'Nothing in pipeline' : 'Nothing in this stage'}
        emptyBody={
          items.length === 0
            ? 'Swipe right on Seekers in Discover. Matched endorsements land here.'
            : 'No endorsements match this filter yet.'
        }
        companyName={companyName}
        pendingId={pendingId}
        refreshing={refreshing}
        notice={notice}
        showDiscoverAction={items.length === 0}
        onAction={handleAction}
        onChat={handleChat}
        onDiscover={openDiscover}
        onRefresh={() => load('refresh')}
        active={isFocused}
      />
    </SafeAreaView>
  );
}

interface ActiveListProps {
  items: ReferrerInboxItem[];
  emptyTitle: string;
  emptyBody: string;
  companyName: string;
  pendingId: string | null;
  refreshing: boolean;
  notice: string | null;
  showDiscoverAction: boolean;
  onAction: (item: ReferrerInboxItem, kind: 'submit' | 'interviewing' | 'outcome' | 'view') => void;
  onChat: (item: ReferrerInboxItem) => void;
  onDiscover: () => void;
  onRefresh: () => void;
  active: boolean;
}

function ActiveList({
  items,
  emptyTitle,
  emptyBody,
  companyName,
  pendingId,
  refreshing,
  notice,
  showDiscoverAction,
  onAction,
  onChat,
  onDiscover,
  onRefresh,
  active,
}: ActiveListProps) {
  const renderItem = useCallback(
    ({ item }: { item: ReferrerInboxItem }) => (
      <ActiveItem
        item={item}
        companyName={companyName}
        pending={pendingId === item.referral.id}
        onAction={onAction}
        onChat={onChat}
        active={active}
      />
    ),
    [active, companyName, onAction, onChat, pendingId],
  );

  if (items.length === 0) {
    return (
      <EmptyState title={emptyTitle} body={emptyBody}>
        {showDiscoverAction && (
          <Button
            label="Review Seekers"
            onPress={onDiscover}
            variant="primary"
            size="medium"
          />
        )}
      </EmptyState>
    );
  }
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.referral.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
      ListHeaderComponent={notice ? <NoticePill message={notice} /> : null}
      renderItem={renderItem}
      removeClippedSubviews={true}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
    />
  );
}

const ActiveItem = React.memo(function ActiveItem({
  item,
  companyName,
  pending,
  onAction,
  onChat,
  active,
}: {
  item: ReferrerInboxItem;
  companyName: string;
  pending: boolean;
  onAction: ActiveListProps['onAction'];
  onChat: ActiveListProps['onChat'];
  active: boolean;
}) {
  return (
    <EndorserVoyageCard
      data={{
        id: item.referral.id,
        seekerName: item.seekerName,
        seekerAvatar: item.seekerAvatar,
        seekerHeadline: item.seekerHeadline,
        targetRole: item.referral.targetRole,
        companyName,
        status: item.referral.status,
        stageTimestamp: latestStageTimestamp(item.referral),
        payoutAmount: DEMO_PAYOUT_PER_HIRE,
      }}
      pending={pending}
      active={active}
      onAction={(kind) => onAction(item, kind)}
      onChat={() => onChat(item)}
    />
  );
});

function handleCardAction(args: {
  item: ReferrerInboxItem;
  kind: 'submit' | 'interviewing' | 'outcome' | 'view';
  transition: (id: string, next: ReferralStatus, message: string) => void;
}) {
  const { item, kind, transition } = args;
  if (kind === 'submit') return confirmSubmit(item, transition);
  if (kind === 'interviewing') return confirmInterviewing(item, transition);
  if (kind === 'outcome') return confirmOutcome(item, transition);
  return undefined;
}

function confirmSubmit(
  item: ReferrerInboxItem,
  transition: (id: string, next: ReferralStatus, message: string) => void,
) {
  Alert.alert(`Submit ${item.seekerName} to HR?`, 'This moves the endorsement forward.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Submit',
      onPress: () => transition(item.referral.id, 'submitted', 'Submitted to HR.'),
    },
  ]);
}

function confirmInterviewing(
  item: ReferrerInboxItem,
  transition: (id: string, next: ReferralStatus, message: string) => void,
) {
  Alert.alert('Mark interviewing?', 'Confirms the seeker has started interviews.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Confirm',
      onPress: () => transition(item.referral.id, 'interviewing', 'Interview started.'),
    },
  ]);
}

function confirmOutcome(
  item: ReferrerInboxItem,
  transition: (id: string, next: ReferralStatus, message: string) => void,
) {
  Alert.alert('Record outcome', `Outcome for ${item.seekerName}?`, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Rejected',
      style: 'destructive',
      onPress: () => transition(item.referral.id, 'rejected', 'Outcome recorded.'),
    },
    {
      text: 'Hired +10',
      onPress: () => transition(item.referral.id, 'hired', 'Hire recorded. Endorsement +10.'),
    },
  ]);
}

function wasHiredThisMonth(item: ReferrerInboxItem): boolean {
  if (item.referral.status !== 'hired' || !item.referral.outcomeAt) return false;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return new Date(item.referral.outcomeAt).getTime() >= start.getTime();
}
