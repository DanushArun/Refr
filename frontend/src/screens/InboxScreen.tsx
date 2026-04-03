import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { referralsApi } from '../services/api';
import type { ReferrerInboxItem } from '@refr/shared';
import type { ReferrerInboxScreenProps } from '../types/navigation';

/**
 * InboxScreen — the referrer's home.
 *
 * Shows incoming referral requests from seekers.
 * Referrers accept or decline here. On acceptance, a chat opens.
 * The "Kingmaker Score" stat at top creates the identity hook.
 */
export function InboxScreen({ navigation }: ReferrerInboxScreenProps) {
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kingmakerScore, setKingmakerScore] = useState<number | null>(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const [inbox, reputation] = await Promise.all([
        referralsApi.getInbox(),
        referralsApi.getReputation(),
      ]);
      setItems(inbox);
      setKingmakerScore(reputation.kingmakerScore);
    } catch (err) {
      Alert.alert('Error', 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInbox(); }, []);

  const handleAccept = async (id: string, seekerName: string, referralId: string, avatarUrl?: string) => {
    try {
      await referralsApi.transition(id, 'accepted');
      setItems((prev) => prev.map((item) => item.referral.id === id ? { ...item, referral: { ...item.referral, status: 'accepted' as any } } : item));
      navigation.navigate('Chat', {
        referralId,
        participantName: seekerName,
        participantAvatar: avatarUrl,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDecline = async (id: string) => {
    Alert.alert('Decline request?', 'The seeker will be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            await referralsApi.transition(id, 'rejected');
            setItems((prev) => prev.filter((item) => item.referral.id !== id));
          } catch {
            Alert.alert('Error', 'Failed to decline request');
          }
        },
      },
    ]);
  };

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
        <View>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>{items.filter((i) => i.referral.status === 'requested').length} new requests</Text>
        </View>
        {kingmakerScore !== null && (
          <View style={styles.scoreChip}>
            <Text style={styles.scoreLabel}>Kingmaker</Text>
            <Text style={styles.scoreValue}>{kingmakerScore}</Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptyBody}>
            Seekers who see you in the feed will send referral requests here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.referral.id}
          contentContainerStyle={styles.list}
          onRefresh={loadInbox}
          refreshing={loading}
          renderItem={({ item }) => (
            <InboxCard
              item={item}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onChatPress={(referralId, name, avatar) =>
                navigation.navigate('Chat', { referralId, participantName: name, participantAvatar: avatar })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function InboxCard({
  item,
  onAccept,
  onDecline,
  onChatPress,
}: {
  item: ReferrerInboxItem;
  onAccept: (id: string, name: string, referralId: string, avatar?: string) => void;
  onDecline: (id: string) => void;
  onChatPress: (referralId: string, name: string, avatar?: string) => void;
}) {
  const isPending = item.referral.status === 'requested';
  const isAccepted = item.referral.status === 'accepted' || item.referral.status === 'submitted' || item.referral.status === 'interviewing';

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Avatar uri={item.seekerAvatar} displayName={item.seekerName} size="md" />
        <View style={styles.cardMeta}>
          <Text style={styles.seekerName}>{item.seekerName}</Text>
          <Text style={styles.seekerHeadline} numberOfLines={2}>{item.seekerHeadline}</Text>
          <Text style={styles.targetRole}>Wants to join as {item.referral.targetRole}</Text>
        </View>
        <Text style={styles.matchScore}>{item.matchScore}%</Text>
      </View>

      {item.referral.seekerNote && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{item.referral.seekerNote}</Text>
        </View>
      )}

      {isPending && (
        <View style={styles.actions}>
          <Button
            label="Accept"
            onPress={() => onAccept(item.referral.id, item.seekerName, item.referral.id, item.seekerAvatar)}
            variant="primary"
            size="medium"
            style={styles.actionBtn}
          />
          <Button
            label="Decline"
            onPress={() => onDecline(item.referral.id)}
            variant="text"
            size="medium"
            style={styles.actionBtn}
          />
        </View>
      )}

      {isAccepted && (
        <Button
          label="Open chat"
          onPress={() => onChatPress(item.referral.id, item.seekerName, item.seekerAvatar)}
          variant="secondary"
          size="medium"
          fullWidth
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing[0.5] },
  scoreChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentDim,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  scoreLabel: { ...typography.caption, color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { ...typography.statMedium, color: colors.text },
  list: { padding: layout.screenPaddingH, gap: spacing[4], paddingBottom: spacing[20] },
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
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing[3],
  },
  cardRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  cardMeta: { flex: 1, gap: spacing[0.5] },
  seekerName: { ...typography.bodyLarge, color: colors.text, fontFamily: 'Outfit-SemiBold' },
  seekerHeadline: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  targetRole: { ...typography.caption, color: colors.accent, marginTop: spacing[1] },
  matchScore: { ...typography.statSmall, color: colors.success },
  noteBox: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 8,
    padding: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noteText: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing[3] },
  actionBtn: { flex: 1 },
});
