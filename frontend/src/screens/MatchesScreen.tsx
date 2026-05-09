import React, { useCallback, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { brandForName } from '../components/discover/companyBrand';
import { referralsApi } from '../services/api';
import type { SeekerPipelineItem } from '@refr/shared';

const BLACK = '#000000';
const BLACK_65 = 'rgba(0, 0, 0, 0.65)';
const BLACK_35 = 'rgba(0, 0, 0, 0.35)';

export function MatchesScreen() {
  const [items, setItems] = useState<SeekerPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    referralsApi.getPipeline()
      .then((data: SeekerPipelineItem[]) => {
        const active = data.filter((item: SeekerPipelineItem) =>
          ['accepted', 'submitted', 'interviewing'].includes(item.referral.status),
        );
        setItems(active);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load matches');
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.subtitle}>
            {items.length} active referral{items.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.referral.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MatchCard
                item={item}
                onPress={() =>
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
                  })
                }
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

interface MatchCardProps {
  item: SeekerPipelineItem;
  onPress: () => void;
}

function MatchCard({ item, onPress }: MatchCardProps) {
  const brand = brandForName(item.companyName);
  const statusColor = getStatusColor(item.referral.status);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardBody}>
        <Avatar displayName={item.referrerName} size="md" />
        <View style={styles.cardMeta}>
          <Text style={styles.referrerName} numberOfLines={1}>
            {item.referrerName}
          </Text>
          <View style={styles.companyLine}>
            <View style={[styles.companyDot, { backgroundColor: brand.tint }]} />
            <Text style={styles.referrerTitle} numberOfLines={1}>
              {item.referral.targetRole} at {item.companyName}
            </Text>
          </View>
          <Badge
            variant="status"
            label={capitalize(item.referral.status)}
            statusColor={statusColor}
            style={styles.statusBadge}
          />
        </View>
        <Ionicons name="chevron-forward" size={16} color={BLACK_35} />
      </View>

      {/* Credit-card material overlays — pointerEvents none, never block taps */}
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.04)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.materialSheen}
        pointerEvents="none"
      />
      <View style={styles.bevelTop} pointerEvents="none" />
      <View style={styles.bevelBottom} pointerEvents="none" />
    </Pressable>
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  container: { flex: 1, backgroundColor: 'transparent' },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  list: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing[3],
    // Tab bar = 70px tall + 26px bottom inset + breathing room
    paddingBottom: 116,
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

  /* Card (cream credit-card, no side strip) */
  card: {
    flexDirection: 'row',
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation: 8,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardMeta: { flex: 1, gap: 3 },
  referrerName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: BLACK,
    letterSpacing: -0.2,
  },
  companyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  referrerTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK_65,
    flex: 1,
  },
  statusBadge: { marginTop: 4 },

  /* Credit-card material overlays */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadius,
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
