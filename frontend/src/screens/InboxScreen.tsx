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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { EndorserOrb } from '../components/constellation/EndorserOrb';
import { brandForName, getCompanyBrand } from '../components/discover/companyBrand';
import { Phrase } from '../utils/haptics';
import { referralsApi } from '../services/api';
import type { ReferrerInboxItem } from '@refr/shared';

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_60 = 'rgba(0, 0, 0, 0.60)';
const BLACK_45 = 'rgba(0, 0, 0, 0.45)';
const BLACK_35 = 'rgba(0, 0, 0, 0.35)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

/**
 * InboxScreen — referrer's home, in nautical credit-card style.
 *
 * Each incoming request renders as a tall credit-card with the same
 * brand-zone-on-top + cream-content-below structure as the seeker's swipe
 * card. Instead of a compact list row, each request gets the full hero
 * treatment so the referrer's eye lands on ONE candidate at a time.
 */
export function InboxScreen() {
  const [items, setItems] = useState<ReferrerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [endorsementScore, setEndorsementScore] = useState<number | null>(null);
  const [hires, setHires] = useState(0);
  const [referrerCompany, setReferrerCompany] = useState<string>('Razorpay');

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const [inbox, reputation] = await Promise.all([
        referralsApi.getInbox(),
        referralsApi.getReputation(),
      ]);
      setItems(inbox);
      setEndorsementScore(reputation.endorsementScore);
      setHires(reputation.successfulHires ?? 0);
      if (reputation.company?.name) setReferrerCompany(reputation.company.name);
    } catch {
      Alert.alert('Error', 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInbox(); }, [loadInbox]);

  const newRequestCount = items.filter((i) => i.referral.status === 'requested').length;

  const handleAccept = async (
    referralId: string,
    seekerName: string,
    avatarUrl?: string,
  ) => {
    Phrase.swipeRequest();
    try {
      await referralsApi.transition(referralId, 'accepted');
      setItems((prev) =>
        prev.map((item) =>
          item.referral.id === referralId
            ? {
                ...item,
                referral: { ...item.referral, status: 'accepted' as const },
              }
            : item,
        ),
      );
      router.push({
        pathname: '/chat',
        params: { referralId, participantName: seekerName, participantAvatar: avatarUrl ?? '' },
      });
    } catch {
      Phrase.error();
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDecline = (referralId: string, seekerName: string) => {
    Phrase.tick();
    Alert.alert(
      'Pass on this request?',
      `${seekerName} will be notified that you're not the right bridge for them right now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pass',
          onPress: async () => {
            Phrase.swipePass();
            try {
              await referralsApi.transition(referralId, 'rejected');
              setItems((prev) => prev.filter((item) => item.referral.id !== referralId));
            } catch {
              Phrase.error();
              Alert.alert('Error', 'Failed to decline request');
            }
          },
        },
      ],
    );
  };

  const handleOpenChat = (referralId: string, seekerName: string, avatar?: string) => {
    Phrase.tap();
    router.push({
      pathname: '/chat',
      params: { referralId, participantName: seekerName, participantAvatar: avatar ?? '' },
    });
  };

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
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>
              {newRequestCount} new request{newRequestCount === 1 ? '' : 's'}
            </Text>
          </View>
          {endorsementScore !== null && (
            <EndorserOrb
              score={endorsementScore}
              hires={hires}
              active={items.filter((i) => i.referral.status !== 'rejected').length}
              size={88}
              showLabel={false}
            />
          )}
        </View>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.referral.id}
            contentContainerStyle={styles.list}
            onRefresh={loadInbox}
            refreshing={loading}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <InboxCard
                item={item}
                referrerCompany={referrerCompany}
                onAccept={() => handleAccept(item.referral.id, item.seekerName, item.seekerAvatar)}
                onDecline={() => handleDecline(item.referral.id, item.seekerName)}
                onOpenChat={() => handleOpenChat(item.referral.id, item.seekerName, item.seekerAvatar)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

interface InboxCardProps {
  item: ReferrerInboxItem;
  referrerCompany: string;
  onAccept: () => void;
  onDecline: () => void;
  onOpenChat: () => void;
}

function InboxCard({ item, referrerCompany, onAccept, onDecline, onOpenChat }: InboxCardProps) {
  const isPending = item.referral.status === 'requested';
  const isAccepted =
    item.referral.status === 'accepted' ||
    item.referral.status === 'submitted' ||
    item.referral.status === 'interviewing';

  // The brand zone of the inbox card shows the referrer's own company —
  // that's the destination the seeker is asking for.
  const brand = brandForName(referrerCompany);
  const matchScore = item.matchScore ?? 75;

  // Skills from the seeker's headline (best-effort split, fallback empty)
  const skills = (item.seekerHeadline?.match(/[A-Z][A-Za-z+#.]{1,}/g) ?? [])
    .filter((s) => !['Senior', 'Junior', 'Staff', 'Lead', 'at', 'and'].includes(s))
    .slice(0, 3);

  return (
    <View style={styles.card}>
      {/* HERO — referrer's company brand zone */}
      <View style={[styles.brandZone, { backgroundColor: brand.tint }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { borderColor: brand.accent }]}>
            <Text style={[styles.brandMarkText, { color: brand.text }]}>{brand.mark}</Text>
          </View>
          <Text style={[styles.brandName, { color: brand.text }]}>{referrerCompany}</Text>
          <View style={styles.brandSpacer} />
          <View style={styles.matchPill}>
            <Text style={styles.matchPillValue}>{matchScore}</Text>
            <Text style={styles.matchPillLabel}>MATCH</Text>
          </View>
        </View>

        <Text style={[styles.role, { color: brand.text }]} numberOfLines={2}>
          {item.referral.targetRole}
        </Text>

        {skills.length > 0 && (
          <View style={styles.skillsRow}>
            {skills.map((s) => (
              <View key={s} style={styles.skillChip}>
                <Text style={[styles.skillText, { color: brand.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* CREAM — the seeker bridge */}
      <View style={styles.cardBody}>
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>REQUESTED BY</Text>
        </View>
        <View style={styles.seekerBlock}>
          <Avatar
            uri={item.seekerAvatar}
            displayName={item.seekerName}
            size="lg"
            verificationRing
          />
          <View style={styles.seekerMeta}>
            <Text style={styles.seekerName} numberOfLines={1}>
              {item.seekerName}
            </Text>
            <Text style={styles.seekerHeadline} numberOfLines={2}>
              {item.seekerHeadline}
            </Text>
          </View>
        </View>

        {item.referral.seekerNote ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteQuote}>“</Text>
            <Text style={styles.noteText}>{item.referral.seekerNote}</Text>
          </View>
        ) : null}

        {isPending && (
          <View style={styles.actions}>
            <Pressable onPress={onDecline} style={styles.passBtn}>
              <Text style={styles.passText}>Pass</Text>
            </Pressable>
            <Pressable onPress={onAccept} style={styles.acceptBtn}>
              <Ionicons name="checkmark" size={16} color="#0A1F44" />
              <Text style={styles.acceptText}>Endorse</Text>
            </Pressable>
          </View>
        )}

        {isAccepted && (
          <Pressable onPress={onOpenChat} style={styles.chatBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={BLACK} />
            <Text style={styles.chatText}>Open chat</Text>
          </Pressable>
        )}
      </View>

      {/* Credit-card material overlays */}
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.05)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.materialSheen}
        pointerEvents="none"
      />
      <View style={styles.bevelTop} pointerEvents="none" />
      <View style={styles.bevelBottom} pointerEvents="none" />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="mail-outline" size={32} color={colors.accent} />
      <Text style={styles.emptyTitle}>No requests yet</Text>
      <Text style={styles.emptyBody}>
        Seekers who chart their course toward you will appear here. Each one is a chance to
        chart someone's career.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerCopy: { flex: 1, gap: spacing[1] },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary },

  list: {
    paddingHorizontal: layout.screenPaddingH,
    gap: 20,
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

  /* Cream credit-card with brand-zone hero */
  card: {
    backgroundColor: colors.cardSurface,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.30,
    shadowRadius: 24,
    elevation: 14,
  },

  /* Brand zone — same vocabulary as the seeker swipe card */
  brandZone: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 18,
  },
  brandName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  brandSpacer: { flex: 1 },
  matchPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    alignItems: 'center',
    minWidth: 56,
  },
  matchPillValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  matchPillLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.4,
    marginTop: -1,
  },
  role: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skillText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
  },

  /* Cream content area */
  cardBody: {
    padding: 22,
    gap: 16,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 2,
  },
  seekerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  seekerMeta: { flex: 1, gap: 3 },
  seekerName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: BLACK,
    letterSpacing: -0.3,
  },
  seekerHeadline: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK_70,
    lineHeight: 18,
  },

  noteBox: {
    backgroundColor: BLACK_05,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  noteQuote: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 28,
    color: BLACK_45,
    lineHeight: 18,
  },
  noteText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13.5,
    color: BLACK,
    lineHeight: 19,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  passBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: BLACK_35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: BLACK_60,
    letterSpacing: 0.2,
  },
  acceptBtn: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  acceptText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#0A1F44',
    letterSpacing: 0.2,
  },
  chatBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: BLACK_35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chatText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: BLACK,
  },

  /* Material overlays */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
