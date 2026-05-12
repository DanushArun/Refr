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
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { EndorserOrb } from '../components/constellation/EndorserOrb';
import { Phrase } from '../utils/haptics';
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
  const [payoutsExpanded, setPayoutsExpanded] = useState(true);

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
  // In-flight count: referrals still pending. For the mock we estimate based
  // on totalReferrals – successfulHires clamped to a sensible display range.
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
        {/* 1 · HERO — gold "money" card */}
        <View style={styles.earningsHero}>
          {/* Gold metallic gradient — bright top-left to deeper gold bottom-right */}
          <LinearGradient
            colors={['#E8BD58', '#D4A744', '#B7892A']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGoldFill}
            pointerEvents="none"
          />
          {/* Top sheen + bottom shade for material depth */}
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.10)']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.materialSheen}
            pointerEvents="none"
          />
          <View style={styles.bevelTop} pointerEvents="none" />
          <View style={styles.bevelBottom} pointerEvents="none" />

          <View style={styles.heroTopRow}>
            <View style={styles.heroTopInfo}>
              <Text style={styles.heroLabel}>LIFETIME EARNINGS</Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {reputation.user.displayName} · {reputation.company.name}
              </Text>
            </View>
            <View style={styles.heroOrbWrap}>
              <EndorserOrb
                score={reputation.endorsementScore}
                hires={reputation.successfulHires ?? 0}
                active={inFlight}
                size={56}
                showLabel={false}
              />
            </View>
          </View>

          <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatINRFull(lifetime)}
          </Text>

          <View style={styles.heroSplits}>
            <HeroTile label="Pending" value={formatINR(pending)} accent={pending > 0} />
            <HeroTile label="Earned" value={formatINR(lifetime)} muted />
            <HeroTile label="In flight" value={String(inFlight)} muted />
          </View>
        </View>

        {/* 2 · TIER — cream credit-card with material (Endorsement Score) */}
        <TierCard score={reputation.endorsementScore} rank={rankPosition} />

        {/* 3 · PAYOUTS — collapsible dark glass list */}
        <View style={styles.section}>
          <PressableScale
            onPress={() => {
              if (payouts.length === 0) return;
              Phrase.tick();
              setPayoutsExpanded((v) => !v);
            }}
            style={styles.sectionHead}
            pressedScale={0.99}
            accessibilityRole="button"
            accessibilityLabel={
              payoutsExpanded ? 'Collapse recent payouts' : 'Expand recent payouts'
            }
          >
            <Text style={styles.sectionTitle}>Recent payouts</Text>
            <View style={styles.sectionRight}>
              <Text style={styles.sectionCount}>{payouts.length}</Text>
              {payouts.length > 0 ? (
                <Ionicons
                  name={payoutsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textTertiary}
                />
              ) : null}
            </View>
          </PressableScale>
          {payouts.length === 0 ? (
            <DarkCard>
              <Text style={styles.emptyText}>
                No hires yet. Submit matched candidates from Activity to start earning.
              </Text>
            </DarkCard>
          ) : payoutsExpanded ? (
            <DarkCard padded={false}>
              {payouts.map((p, i) => (
                <PayoutRow
                  key={p.id}
                  payout={p}
                  isLast={i === payouts.length - 1}
                />
              ))}
            </DarkCard>
          ) : null}
        </View>

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

// Full Indian-locale grouping (e.g. ₹66,000, ₹2,20,000) — used for the hero
// lifetime number where there's room for the actual amount.
function formatINRFull(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
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
  // Hero card is gold — text is dark; accent (positive money) goes deeper bronze
  const color = accent ? '#5D3F0E' : muted ? 'rgba(0, 0, 0, 0.55)' : '#000000';
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
 * Cream credit-card container with material overlays — used for the leaderboard
 * (and any future "achievement" surface) so it feels like the same artefact as
 * the earnings hero.
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

/** Dark glass section surface — used for the payouts list. */
function DarkCard({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={styles.glassCard}>
      <View style={padded ? styles.glassCardBody : undefined}>{children}</View>
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
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[6],
    paddingBottom: 116,
    gap: spacing[6],
  },

  /* Hero — gold metallic "money" card (compact) */
  earningsHero: {
    borderRadius: layout.cardBorderRadiusLarge,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    overflow: 'hidden',
    gap: spacing[2],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 14,
  },
  heroGoldFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadiusLarge,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heroOrbWrap: {
    // Orb component renders a small overshoot for halo bleed. Negative margins
    // recover that overshoot so the orb aligns to the card's right padding
    // instead of pushing the row taller.
    marginRight: -spacing[1],
    marginVertical: -spacing[1],
  },
  heroTopInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  heroLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.65)',
    letterSpacing: 2.4,
  },
  heroSub: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.62)',
  },
  heroValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.6,
    color: '#000000',
  },
  heroSplits: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing[3],
  },
  heroTile: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  heroTileLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 1.0,
  },
  heroTileValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 16,
    letterSpacing: -0.3,
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },

  /* Section */
  section: { gap: spacing[2] },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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

  /* Payouts — dark glass list */
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  payoutRowLast: { borderBottomWidth: 0 },
  payoutMeta: { flex: 1, gap: 2 },
  payoutName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  payoutSub: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.textSecondary,
  },
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
  emptyText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  /* Tier card — dark glass */
  tierCard: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: layout.cardBorderRadius,
    padding: spacing[5],
    gap: spacing[4],
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.18)',
  },
  tierScoreLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1.8,
  },
  tierScoreValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 64,
    lineHeight: 68,
    color: colors.text,
    letterSpacing: -2,
    marginTop: -spacing[1],
  },
  tierContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  tierContextDot: {
    color: colors.textTertiary,
    fontSize: 16,
  },
  tierContextRank: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: colors.text,
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
    color: colors.textTertiary,
  },
  progressRailWrap: {
    paddingHorizontal: 2,
  },
  progressRail: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: colors.background,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressKnobNum: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 10,
    color: colors.text,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    gap: 2,
  },
  scoreRuleLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
    color: colors.textSecondary,
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

  /* Cream credit-card container — used for leaderboard */
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

  /* Dark glass section card — used for the payouts list */
  glassCard: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  glassCardBody: {
    padding: spacing[4],
  },
});
