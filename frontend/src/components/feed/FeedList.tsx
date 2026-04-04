import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  type ListRenderItem,
} from 'react-native';
import type { FeedCard } from '@refr/shared';
import { CareerStoryCard } from './CareerStoryCard';
import { CompanyIntelCard } from './CompanyIntelCard';
import { ReferralEventCard } from './ReferralEventCard';
import { EditorialCard } from './EditorialCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface FeedListProps {
  cards: FeedCard[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onReferPress: (card: FeedCard) => void;
  onCardPress?: (card: FeedCard) => void;
  onFetchMore: () => void;
  onRefresh: () => void;
}

/**
 * FeedList — the core infinite scroll feed.
 *
 * Uses FlatList (not ScrollView) for virtualized rendering.
 * The `keyExtractor` uses card.id — stable across refreshes.
 * `onEndReachedThreshold=0.4` triggers the next page fetch
 * when the user is 40% from the bottom — early enough to feel seamless.
 *
 * Variable-height cards (career story vs company intel vs event)
 * are dispatched from a single renderItem function that switches on card.type.
 */
export function FeedList({
  cards,
  loading,
  refreshing,
  hasMore,
  onReferPress,
  onCardPress,
  onFetchMore,
  onRefresh,
}: FeedListProps) {
  const renderItem: ListRenderItem<FeedCard> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'career_story':
          return (
            <CareerStoryCard
              card={item}
              onReferPress={() => onReferPress(item)}
              onCardPress={onCardPress ? () => onCardPress(item) : undefined}
            />
          );
        case 'company_intel':
          return (
            <CompanyIntelCard
              card={item}
              onPress={onCardPress ? () => onCardPress(item) : undefined}
            />
          );
        case 'referral_event':
          return <ReferralEventCard card={item} />;
        case 'milestone':
          return <ReferralEventCard card={{
            ...item,
            type: 'referral_event',
            referrerDisplayName: '',
            seekerDisplayName: '',
            companyName: '',
            eventDescription: (item as any).description || (item as any).title || '',
          } as any} />;
        case 'editorial':
          return (
            <EditorialCard
              card={item as any}
              onPress={onCardPress ? () => onCardPress(item) : undefined}
            />
          );
        default:
          return null;
      }
    },
    [onReferPress, onCardPress],
  );

  const ListFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>You're caught up</Text>
        </View>
      );
    }
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    }
    return null;
  };

  const ListEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Feed loading...</Text>
        <Text style={styles.emptySubtitle}>
          Bangalore tech intel is on its way.
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={cards}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={onFetchMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      // Performance
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={10}
      initialNumToRender={5}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing[4],
    paddingBottom: spacing[24],
  },
  footer: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[20],
    gap: spacing[2],
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
