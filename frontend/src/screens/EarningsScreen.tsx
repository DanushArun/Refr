import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { StatCard } from '../components/common/StatCard';
import { referralsApi } from '../services/api';

interface ReputationData {
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
  department: string;
  jobTitle: string;
  user: { displayName: string };
  company: { name: string };
}

interface LeaderboardEntry {
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
  user: { id: string; displayName: string };
  company: { name: string };
}

/**
 * EarningsScreen — the referrer's Kingmaker dashboard.
 *
 * This is the identity screen. Shows the Kingmaker Score prominently
 * (using JetBrains Mono for the numeric display). The score is the
 * primary retention mechanism — referrers keep coming back to see it grow.
 *
 * Also shows the global leaderboard (social comparison engine).
 */
export function EarningsScreen() {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      referralsApi.getReputation(),
      referralsApi.getLeaderboard(),
    ]).then(([rep, lb]) => {
      setReputation(rep);
      setLeaderboard(lb);
    }).catch(() => {
      Alert.alert('Error', 'Failed to load earnings data');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!reputation) return null;

  const rankPosition = leaderboard.findIndex((e) => e.user.displayName === reputation.user.displayName) + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Kingmaker Score */}
        <View style={styles.scoreHero}>
          <Text style={styles.scoreLabel}>KINGMAKER SCORE</Text>
          <Text style={styles.scoreValue}>{reputation.kingmakerScore}</Text>
          <Text style={styles.scoreSubtitle}>
            {reputation.user.displayName} · {reputation.company.name}
          </Text>
          {rankPosition > 0 && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rankPosition} on leaderboard</Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Total referrals" value={String(reputation.totalReferrals)} />
          <StatCard label="Successful hires" value={String(reputation.successfulHires)} valueColor={colors.accent} />
          <StatCard
            label="Hire rate"
            value={reputation.totalReferrals > 0
              ? `${Math.round((reputation.successfulHires / reputation.totalReferrals) * 100)}%`
              : '—'}
          />
        </View>

        {/* How the score works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How your score grows</Text>
          <ScoreRule icon="→" label="Refer someone" points="+2" />
          <ScoreRule icon="★" label="Hire confirmed" points="+10" />
          <ScoreRule icon="▼" label="Inactive 2+ weeks" points="-1/week" negative />
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bangalore Kingmaker Board</Text>
          {leaderboard.slice(0, 20).map((entry, idx) => (
            <LeaderboardRow key={entry.user.id} rank={idx + 1} entry={entry} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScoreRule({ icon, label, points, negative }: {
  icon: string;
  label: string;
  points: string;
  negative?: boolean;
}) {
  return (
    <View style={styles.scoreRule}>
      <Text style={styles.scoreRuleIcon}>{icon}</Text>
      <Text style={styles.scoreRuleLabel}>{label}</Text>
      <Text style={[styles.scoreRulePoints, negative && { color: colors.error }]}>
        {points}
      </Text>
    </View>
  );
}

function LeaderboardRow({ rank, entry }: { rank: number; entry: LeaderboardEntry }) {
  const isMedal = rank <= 3;
  const medals = ['', '★', '✦', '◆'];

  return (
    <View style={[styles.lbRow, isMedal && styles.lbRowMedal]}>
      <Text style={styles.lbRank}>{isMedal ? medals[rank] : `#${rank}`}</Text>
      <View style={styles.lbMeta}>
        <Text style={styles.lbName}>{entry.user.displayName}</Text>
        <Text style={styles.lbCompany}>{entry.company.name}</Text>
      </View>
      <View style={styles.lbRight}>
        <Text style={styles.lbScore}>{entry.kingmakerScore}</Text>
        <Text style={styles.lbHires}>{entry.successfulHires} hire{entry.successfulHires !== 1 ? 's' : ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: spacing[20],
    gap: spacing[8],
  },
  scoreHero: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
    backgroundColor: colors.accentLight,
    borderRadius: layout.cardBorderRadiusLarge,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  scoreLabel: {
    ...typography.label,
    color: colors.accent,
    letterSpacing: 2,
  },
  scoreValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 72,
    lineHeight: 80,
    color: colors.text,
    letterSpacing: -2,
  },
  scoreSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rankBadge: {
    marginTop: spacing[1],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    backgroundColor: colors.accentPressedBg,
    borderRadius: 100,
  },
  rankText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  section: { gap: spacing[3] },
  sectionTitle: { ...typography.h4, color: colors.text },
  scoreRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreRuleIcon: { fontSize: 16, color: colors.textTertiary, width: 24, textAlign: 'center' },
  scoreRuleLabel: { ...typography.body, color: colors.textSecondary, flex: 1 },
  scoreRulePoints: { ...typography.statSmall, color: colors.success },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lbRowMedal: {
    backgroundColor: colors.accentLight,
    borderRadius: 8,
    borderBottomWidth: 0,
    paddingHorizontal: spacing[3],
    marginHorizontal: -spacing[3],
  },
  lbRank: { ...typography.statSmall, color: colors.accent, width: 32, textAlign: 'center' },
  lbMeta: { flex: 1, gap: 2 },
  lbName: { ...typography.body, color: colors.text, fontFamily: 'Outfit-SemiBold' },
  lbCompany: { ...typography.caption, color: colors.textTertiary },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbScore: { ...typography.statSmall, color: colors.text },
  lbHires: { ...typography.caption, color: colors.textTertiary },
});
