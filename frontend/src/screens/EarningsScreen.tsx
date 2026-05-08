import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
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
import { EndorserOrb } from '../components/constellation/EndorserOrb';
import { TierBadge } from '../components/tier/TierBadge';
import { LinearGradient } from 'expo-linear-gradient';
import {
  nextTier,
  pointsToNextTier,
  progressToNextTier,
  tierForScore,
} from '../components/tier/tiers';
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
 *   4. LEADERBOARD — top 10 endorsers, viewer's row highlighted
 *
 * The Endorsement Score is NOT the star here; money is. The Score is a
 * reputation multiplier that appears secondary to the ₹ story.
 */
export function EarningsScreen() {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
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

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        {/* 1 · HERO — earnings on a cream credit-card */}
        <View style={styles.earningsHero}>
          <View style={styles.heroOrbWrap}>
            <EndorserOrb
              score={reputation.endorsementScore}
              hires={reputation.successfulHires ?? 0}
              active={inFlight}
              size={120}
              showLabel={false}
            />
          </View>
          <Text style={styles.heroLabel}>LIFETIME EARNINGS</Text>
          <Text style={styles.heroValue}>{formatINR(lifetime)}</Text>
          <Text style={styles.heroSub}>
            {reputation.user.displayName} · {reputation.company.name}
          </Text>

          {/* Material overlays — same nautical credit-card treatment */}
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

          <View style={styles.heroSplits}>
            <HeroTile label="This month" value={formatINR(thisMonth)} accent={thisMonth > 0} />
            <HeroTile label="Pending" value={formatINR(pending)} muted />
            <HeroTile label="Per hire" value={formatINR(PAYOUT_PER_HIRE)} muted />
          </View>
        </View>

        {/* 2 · PAYOUTS — cream credit-card list */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent payouts</Text>
            <Text style={styles.sectionCount}>{payouts.length}</Text>
          </View>
          {payouts.length === 0 ? (
            <CreamCard>
              <Text style={styles.emptyText}>
                No hires yet. Submit matched candidates from Activity to start earning.
              </Text>
            </CreamCard>
          ) : (
            <CreamCard padded={false}>
              {payouts.map((p, i) => (
                <PayoutRow
                  key={p.id}
                  payout={p}
                  isLast={i === payouts.length - 1}
                />
              ))}
            </CreamCard>
          )}
        </View>

        {/* 3 · TIER — cream credit-card with material */}
        <TierCard score={reputation.endorsementScore} rank={rankPosition} />

        {/* 4 · LEADERBOARD — cream credit-card list */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Endorser Leaderboard</Text>
            <Text style={styles.sectionCount}>top 10</Text>
          </View>
          <CreamCard padded={false}>
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <LeaderboardRow
                key={entry.user.id}
                rank={idx + 1}
                entry={entry}
                isViewer={entry.user.displayName === reputation.user.displayName}
                isLast={idx === 9 || idx === leaderboard.length - 1}
              />
            ))}
          </CreamCard>
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
  // Hero card is cream — text is dark by default; gold accent stays brand-colored
  const color = accent ? '#B07A1A' : muted ? 'rgba(0, 0, 0, 0.55)' : '#000000';
  return (
    <View style={styles.heroTile}>
      <Text style={styles.heroTileLabel}>{label.toUpperCase()}</Text>
      <Text style={[styles.heroTileValue, { color }]}>{value}</Text>
    </View>
  );
}

function PayoutRow({ payout, isLast }: { payout: Payout; isLast?: boolean }) {
  return (
    <View style={[styles.payoutRow, isLast && styles.payoutRowLast]}>
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

/**
 * Cream credit-card container with material overlays. Used for any list/section
 * surface so the entire screen reads as one consistent vocabulary.
 */
function CreamCard({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={styles.creamCard}>
      <View style={padded ? styles.creamCardBody : undefined}>{children}</View>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.05)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.creamCardSheen}
        pointerEvents="none"
      />
      <View style={styles.creamCardBevelTop} pointerEvents="none" />
      <View style={styles.creamCardBevelBottom} pointerEvents="none" />
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

/**
 * Single-card tier visual.
 * Score is the visual hero. Tier + rank appear as one context line below.
 * The progress bar is bookended by the current and next tier — no orphan badges.
 * Rules sit as a tight row at the bottom.
 */
function TierCard({ score, rank }: { score: number; rank: number }) {
  const current = tierForScore(score);
  const next = nextTier(score);
  const pct = progressToNextTier(score);
  const remaining = pointsToNextTier(score);

  return (
    <View style={styles.tierCard}>
      {/* Hero: the score */}
      <Text style={styles.tierScoreLabel}>ENDORSEMENT SCORE</Text>
      <Text style={styles.tierScoreValue}>{score}</Text>
      <View style={styles.tierContextRow}>
        <TierBadge score={score} size="md" />
        {rank > 0 && (
          <>
            <Text style={styles.tierContextDot}>·</Text>
            <Text style={styles.tierContextRank}>
              #{rank} <Text style={{ color: colors.textTertiary }}>rank</Text>
            </Text>
          </>
        )}
      </View>

      {/* Progression rail */}
      {next && (
        <View style={styles.progressBlock}>
          <View style={styles.progressEnds}>
            <View style={styles.progressEndLeft}>
              <Text style={[styles.progressTierName, { color: current.color }]}>
                {current.name.toUpperCase()}
              </Text>
              <Text style={styles.progressEndNum}>{current.min}</Text>
            </View>
            <View style={styles.progressEndRight}>
              <Text style={[styles.progressTierName, { color: next.color }]}>
                {next.name.toUpperCase()}
              </Text>
              <Text style={styles.progressEndNum}>{next.min}</Text>
            </View>
          </View>

          <View style={styles.progressRailWrap}>
            <View style={styles.progressRail}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct * 100}%`, backgroundColor: current.glow },
                ]}
              />
              {/* Knob at the progress tip */}
              <View
                style={[
                  styles.progressKnob,
                  {
                    left: `${pct * 100}%`,
                    borderColor: current.glow,
                  },
                ]}
              >
                <Text style={styles.progressKnobNum}>{score}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.progressHint}>
            <Text style={{ color: next.color, fontFamily: 'JetBrainsMono-Medium' }}>
              {remaining} pts
            </Text>
            <Text style={{ color: colors.textSecondary }}> to {next.name}</Text>
          </Text>
        </View>
      )}

      {!next && (
        <Text style={[styles.progressHint, { color: current.color, marginTop: spacing[2] }]}>
          Top tier reached. Keep endorsing — score decays after 14 days idle.
        </Text>
      )}

      {/* Rules */}
      <View style={styles.scoreRules}>
        <ScoreRule label="Per match" delta="+2" />
        <ScoreRule label="Per hire" delta="+10" />
        <ScoreRule label="2wks idle" delta="−1/wk" negative />
      </View>
    </View>
  );
}

function LeaderboardRow({
  rank,
  entry,
  isViewer,
  isLast,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isViewer: boolean;
  isLast?: boolean;
}) {
  const medals = ['', '★', '✦', '◆'];
  const isMedal = rank <= 3;
  return (
    <View
      style={[
        styles.lbRow,
        isViewer && styles.lbRowYou,
        isLast && styles.lbRowLast,
      ]}
    >
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
        <TierBadge score={entry.endorsementScore} size="sm" />
        <Text style={styles.lbScore}>{entry.endorsementScore}</Text>
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
    paddingBottom: 116,
    gap: spacing[6],
  },

  /* Hero — gold-trimmed cream credit-card */
  earningsHero: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadiusLarge,
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 22,
    elevation: 14,
  },
  heroLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 2.4,
  },
  heroValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 56,
    lineHeight: 62,
    letterSpacing: -2,
    color: '#000000',
  },
  heroSub: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.60)',
    marginBottom: spacing[4],
  },
  heroSplits: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing[3],
  },
  heroTile: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  heroTileLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: 'rgba(0, 0, 0, 0.50)',
    letterSpacing: 1.0,
  },
  heroTileValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  heroOrbWrap: {
    marginBottom: spacing[2],
  },
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadiusLarge,
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
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

  /* Payouts — cream credit-card list with material */
  payoutCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation: 8,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  payoutRowLast: { borderBottomWidth: 0 },
  payoutMeta: { flex: 1, gap: 2 },
  payoutName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  payoutSub: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.60)',
  },
  payoutRight: { alignItems: 'flex-end', gap: 2 },
  payoutAmount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: '#15803D',
  },
  payoutDate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
  },

  /* Empty state */
  emptyBlock: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[4],
  },
  emptyText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.60)',
    lineHeight: 19,
  },

  /* Tier card — cream credit-card */
  tierCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[5],
    gap: spacing[4],
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  tierScoreLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.50)',
    letterSpacing: 1.8,
  },
  tierScoreValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 64,
    lineHeight: 68,
    color: '#000000',
    letterSpacing: -2,
    marginTop: -spacing[1],
  },
  tierContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  tierContextDot: {
    color: 'rgba(0, 0, 0, 0.40)',
    fontSize: 16,
  },
  tierContextRank: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#000000',
  },
  progressBlock: {
    alignSelf: 'stretch',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  progressEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressEndLeft: { alignItems: 'flex-start', gap: 2 },
  progressEndRight: { alignItems: 'flex-end', gap: 2 },
  progressTierName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  progressEndNum: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
  },
  progressRailWrap: {
    paddingHorizontal: 2,
  },
  progressRail: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressKnob: {
    position: 'absolute',
    top: -10,
    marginLeft: -16,
    width: 32,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAFAF7',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressKnobNum: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    color: '#000000',
  },
  progressHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: spacing[1],
  },
  scoreRules: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  scoreRule: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    gap: 2,
  },
  scoreRuleLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.3,
  },
  scoreRuleDelta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },

  /* Leaderboard rows on cream */
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  lbRowLast: { borderBottomWidth: 0 },
  lbRowYou: {
    backgroundColor: 'rgba(212, 167, 68, 0.14)',
    borderBottomWidth: 0,
  },
  lbRank: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: '#B07A1A',
    width: 28,
    textAlign: 'center',
  },
  lbMeta: { flex: 1, gap: 2 },
  lbName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  lbCompany: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.55)',
  },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbScore: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: '#000000',
  },
  lbHires: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
  },

  /* Reusable cream credit-card with material */
  creamCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  creamCardBody: {
    padding: spacing[4],
  },
  creamCardSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadius,
  },
  creamCardBevelTop: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  creamCardBevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
