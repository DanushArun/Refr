import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar } from '../components/common/Avatar';
import { TierBadge } from '../components/tier/TierBadge';
import { TierProgress } from '../components/tier/TierProgress';
import {
  referralsApi,
  type LeaderboardEntry,
  type ReputationData,
} from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

const PAYOUT_PER_HIRE = 22000;

/**
 * Earnings — the endorser's financial + reputation dashboard.
 *
 * Information architecture (top to bottom, density descending):
 *   1. HERO       — lifetime earnings, this month, pending (the ₹ story)
 *   2. PAYOUTS    — list of recent successful hires with amounts + dates
 *   3. SCORE      — Endorsement Score as a secondary card (was the hero before)
 *   4. LEADERBOARD — top 10 Bangalore, viewer's row highlighted
 *
 * The Endorsement Score is NOT the star here; money is. The Score is a
 * reputation multiplier that appears secondary to the ₹ story.
 */
export function EarningsScreen() {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      referralsApi.getReputation(),
      referralsApi.getLeaderboard(),
    ])
      .then(([rep, lb]) => {
        setReputation(rep);
        setLeaderboard(lb);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load earnings data');
      })
      .finally(() => setLoading(false));
  }, []);

  const payouts = useMemo(() => buildMockPayouts(reputation?.successfulHires ?? 0), [reputation]);

  if (loading || !reputation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const lifetime = reputation.successfulHires * PAYOUT_PER_HIRE;
  const thisMonth = payouts
    .filter((p) => isThisMonth(p.dateISO))
    .reduce((sum, p) => sum + p.amount, 0);
  // In-flight count: referrals still pending. For the mock we estimate based on
  // totalReferrals – successfulHires clamped to a sensible display range.
  const inFlight = Math.max(
    0,
    reputation.totalReferrals - reputation.successfulHires,
  );
  const pending = inFlight * PAYOUT_PER_HIRE;

  const rankPosition = leaderboard.findIndex(
    (e) => e.user.displayName === reputation.user.displayName,
  ) + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 · HERO — earnings */}
        <View style={styles.earningsHero}>
          <Text style={styles.heroLabel}>LIFETIME EARNINGS</Text>
          <Text style={styles.heroValue}>{formatINR(lifetime)}</Text>
          <Text style={styles.heroSub}>
            {reputation.user.displayName} · {reputation.company.name}
          </Text>

          <View style={styles.heroSplits}>
            <HeroTile label="This month" value={formatINR(thisMonth)} accent={thisMonth > 0} />
            <HeroTile label="Pending" value={formatINR(pending)} muted />
            <HeroTile label="Per hire" value={formatINR(PAYOUT_PER_HIRE)} muted />
          </View>
        </View>

        {/* 2 · PAYOUTS */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent payouts</Text>
            <Text style={styles.sectionCount}>{payouts.length}</Text>
          </View>
          {payouts.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyText}>
                No hires yet. Submit matched candidates from Activity to start earning.
              </Text>
            </View>
          ) : (
            payouts.map((p) => <PayoutRow key={p.id} payout={p} />)
          )}
        </View>

        {/* 3 · TIER — gamified progression, not just a score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardTop}>
            <View style={{ gap: spacing[1] }}>
              <Text style={styles.scoreCardLabel}>TIER</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                <TierBadge score={reputation.kingmakerScore} size="lg" />
                {rankPosition > 0 && (
                  <View style={styles.rankChip}>
                    <Text style={styles.rankChipText}>#{rankPosition} Bangalore</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TierProgress score={reputation.kingmakerScore} variant="full" />

          <View style={styles.scoreRules}>
            <ScoreRule label="Per match" delta="+2" />
            <ScoreRule label="Per hire" delta="+10" />
            <ScoreRule label="2wks inactive" delta="−1/wk" negative />
          </View>
        </View>

        {/* 4 · LEADERBOARD */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Bangalore Endorser Board</Text>
            <Text style={styles.sectionCount}>top 10</Text>
          </View>
          {leaderboard.slice(0, 10).map((entry, idx) => (
            <LeaderboardRow
              key={entry.user.id}
              rank={idx + 1}
              entry={entry}
              isViewer={entry.user.displayName === reputation.user.displayName}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── helpers ───────────────────────────────────────────────── */

function formatINR(n: number): string {
  if (n === 0) return '₹0';
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

interface Payout {
  id: string;
  candidateName: string;
  companyName: string;
  role: string;
  dateISO: string;
  amount: number;
}

function buildMockPayouts(hires: number): Payout[] {
  const base = [
    { candidateName: 'Shreya Nair', role: 'Sr Full-stack Engineer', daysAgo: 6 },
    { candidateName: 'Neha Kulkarni', role: 'Sr Data Engineer', daysAgo: 23 },
    { candidateName: 'Karthik Ramesh', role: 'Sr Backend Engineer', daysAgo: 48 },
    { candidateName: 'Aditi Sharma', role: 'Senior PM', daysAgo: 74 },
    { candidateName: 'Nikhil Rao', role: 'ML Engineer', daysAgo: 105 },
  ];
  return base.slice(0, hires).map((b, i) => ({
    id: `payout-${i}`,
    candidateName: b.candidateName,
    companyName: 'Razorpay',
    role: b.role,
    dateISO: new Date(Date.now() - b.daysAgo * 86_400_000).toISOString(),
    amount: PAYOUT_PER_HIRE,
  }));
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── subcomponents ─────────────────────────────────────────── */

function HeroTile({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  const color = accent ? colors.accent : muted ? colors.textSecondary : colors.text;
  return (
    <View style={styles.heroTile}>
      <Text style={styles.heroTileLabel}>{label.toUpperCase()}</Text>
      <Text style={[styles.heroTileValue, { color }]}>{value}</Text>
    </View>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  return (
    <View style={styles.payoutRow}>
      <Avatar displayName={payout.candidateName} size="sm" />
      <View style={styles.payoutMeta}>
        <Text style={styles.payoutName} numberOfLines={1}>{payout.candidateName}</Text>
        <Text style={styles.payoutSub} numberOfLines={1}>
          {payout.role} · {payout.companyName}
        </Text>
      </View>
      <View style={styles.payoutRight}>
        <Text style={styles.payoutAmount}>{formatINR(payout.amount)}</Text>
        <Text style={styles.payoutDate}>{shortDate(payout.dateISO)}</Text>
      </View>
    </View>
  );
}

function ScoreRule({ label, delta, negative }: { label: string; delta: string; negative?: boolean }) {
  return (
    <View style={styles.scoreRule}>
      <Text style={styles.scoreRuleLabel}>{label}</Text>
      <Text style={[styles.scoreRuleDelta, { color: negative ? colors.error : colors.success }]}>
        {delta}
      </Text>
    </View>
  );
}

function LeaderboardRow({
  rank,
  entry,
  isViewer,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isViewer: boolean;
}) {
  const medals = ['', '★', '✦', '◆'];
  const isMedal = rank <= 3;
  return (
    <View style={[styles.lbRow, isViewer && styles.lbRowYou]}>
      <Text style={styles.lbRank}>{isMedal ? medals[rank] : `#${rank}`}</Text>
      <Avatar displayName={entry.user.displayName} size="sm" />
      <View style={styles.lbMeta}>
        <Text style={styles.lbName}>
          {entry.user.displayName}
          {isViewer ? '  · you' : ''}
        </Text>
        <Text style={styles.lbCompany}>{entry.company.name}</Text>
      </View>
      <View style={styles.lbRight}>
        <TierBadge score={entry.kingmakerScore} size="sm" />
        <Text style={styles.lbScore}>{entry.kingmakerScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: spacing[20],
    gap: spacing[6],
  },

  /* Hero */
  earningsHero: {
    backgroundColor: 'rgba(124,58,237,0.10)',
    borderRadius: layout.cardBorderRadiusLarge,
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
  },
  heroLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 2,
  },
  heroValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 56,
    lineHeight: 62,
    letterSpacing: -2,
    color: colors.text,
  },
  heroSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing[4],
  },
  heroSplits: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing[3],
  },
  heroTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  heroTileLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  heroTileValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 16,
    letterSpacing: -0.3,
  },

  /* Section */
  section: { gap: spacing[2] },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  /* Payouts */
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  payoutMeta: { flex: 1, gap: 2 },
  payoutName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  payoutSub: { ...typography.caption, color: colors.textSecondary },
  payoutRight: { alignItems: 'flex-end', gap: 2 },
  payoutAmount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: colors.success,
  },
  payoutDate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },

  /* Empty state */
  emptyBlock: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: 12,
    padding: spacing[4],
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  /* Score card */
  scoreCard: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[5],
    gap: spacing[4],
  },
  scoreCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scoreCardLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
  scoreCardValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 36,
    lineHeight: 40,
    color: colors.text,
    letterSpacing: -1,
  },
  scoreRankRow: { alignItems: 'flex-end', gap: spacing[1] },
  rankChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 100,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  rankChipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    color: colors.accent,
  },
  scoreRules: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  scoreRule: {
    flex: 1,
    backgroundColor: colors.surfaceInset,
    borderRadius: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    gap: 2,
  },
  scoreRuleLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  scoreRuleDelta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },

  /* Leaderboard */
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  lbRowYou: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing[3],
    borderBottomWidth: 0,
  },
  lbRank: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: colors.accent,
    width: 28,
    textAlign: 'center',
  },
  lbMeta: { flex: 1, gap: 2 },
  lbName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  lbCompany: { ...typography.caption, color: colors.textTertiary },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbScore: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: colors.text,
  },
  lbHires: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
});
