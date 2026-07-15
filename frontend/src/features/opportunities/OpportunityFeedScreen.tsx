import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '../../components/common/PressableScale';
import { opportunitiesApi, Opportunity } from '../../services/api/opportunities';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { OpportunityCard } from './OpportunityCard';

type FeedStatus = 'loading' | 'ready' | 'error';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface OpportunityFeedScreenProps {
  onOpenOpportunity: (opportunity: Opportunity) => void;
}

interface FeedModel {
  opportunities: Opportunity[];
  reload: () => Promise<void>;
  status: FeedStatus;
}

interface MessageStateProps {
  icon: IconName;
  title: string;
  body: string;
  onRetry?: () => void;
}

interface OpportunityListProps extends OpportunityFeedScreenProps {
  opportunities: Opportunity[];
  pageHeight: number;
}

function useOpportunityFeed(): FeedModel {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<FeedStatus>('loading');

  const reload = useCallback(async (): Promise<void> => {
    setStatus('loading');
    try {
      const nextOpportunities = await opportunitiesApi.browse();
      setOpportunities(nextOpportunities);
      setStatus('ready');
    } catch (_error: unknown) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { opportunities, reload, status };
}

function LoadingState(): React.ReactElement {
  return (
    <View accessibilityLiveRegion="polite" style={styles.state}>
      <ActivityIndicator color={colors.brass} size="large" />
      <Text style={styles.stateTitle}>Loading opportunities</Text>
    </View>
  );
}

function MessageState({
  icon,
  title,
  body,
  onRetry,
}: MessageStateProps): React.ReactElement {
  return (
    <View accessibilityLiveRegion="polite" style={styles.state}>
      <Ionicons name={icon} size={30} color={colors.textSecondary} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
      {onRetry ? (
        <PressableScale
          accessibilityHint="Reloads the opportunity feed"
          accessibilityLabel="Retry loading opportunities"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Ionicons name="refresh" size={21} color={colors.navy} />
        </PressableScale>
      ) : null}
    </View>
  );
}

function OpportunityList({
  opportunities,
  pageHeight,
  onOpenOpportunity,
}: OpportunityListProps): React.ReactElement {
  return (
    <FlatList
      accessibilityLabel="Open opportunities"
      data={opportunities}
      decelerationRate="fast"
      disableIntervalMomentum
      getItemLayout={(_data, index) => ({
        index,
        length: pageHeight,
        offset: pageHeight * index,
      })}
      initialNumToRender={2}
      keyExtractor={(opportunity) => opportunity.id}
      maxToRenderPerBatch={2}
      renderItem={({ item }) => (
        <View style={[styles.page, { height: pageHeight }]}>
          <OpportunityCard opportunity={item} onOpen={onOpenOpportunity} />
        </View>
      )}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={pageHeight}
      windowSize={3}
    />
  );
}

function FeedContent({
  status,
  opportunities,
  reload,
  pageHeight,
  onOpenOpportunity,
}: FeedModel & OpportunityListProps): React.ReactElement {
  if (status === 'loading' || pageHeight === 0) return <LoadingState />;
  if (status === 'error') {
    return (
      <MessageState
        body="The roles could not be reached."
        icon="cloud-offline-outline"
        onRetry={() => void reload()}
        title="Could not load opportunities"
      />
    );
  }
  if (opportunities.length === 0) {
    return (
      <MessageState
        body="There are no open roles to show."
        icon="briefcase-outline"
        title="No opportunities"
      />
    );
  }
  return (
    <OpportunityList
      opportunities={opportunities}
      pageHeight={pageHeight}
      onOpenOpportunity={onOpenOpportunity}
    />
  );
}

export function OpportunityFeedScreen({
  onOpenOpportunity,
}: OpportunityFeedScreenProps): React.ReactElement {
  const feed = useOpportunityFeed();
  const [pageHeight, setPageHeight] = useState(0);
  const measurePage = useCallback((event: LayoutChangeEvent): void => {
    setPageHeight(Math.floor(event.nativeEvent.layout.height));
  }, []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DISCOVER</Text>
        <Text style={styles.screenTitle}>Opportunities</Text>
      </View>
      <View onLayout={measurePage} style={styles.feed}>
        <FeedContent
          {...feed}
          onOpenOpportunity={onOpenOpportunity}
          pageHeight={pageHeight}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: layout.headerHeight,
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  eyebrow: {
    ...typography.sectionEyebrow,
    color: colors.brass,
    marginBottom: spacing[1],
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.text,
  },
  feed: {
    flex: 1,
  },
  page: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[8],
  },
  stateTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  stateBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.brass,
  },
});
