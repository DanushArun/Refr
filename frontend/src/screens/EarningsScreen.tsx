import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator,
  Alert,
  
  ScrollView,
  Text,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { EndorserOrb } from '../components/constellation/EndorserOrb';
import { Phrase } from '../utils/haptics';
import { TierBadge } from '../components/tier/TierBadge';
import { ReputationRail } from '../components/tier/ReputationRail';
import { LinearGradient } from 'expo-linear-gradient';
import { earningsScreenStyles as styles } from './earnings/earningsScreenStyles';
import {
  referralsApi,
  type LeaderboardEntry,
  type ReputationData,
} from '../services/api';
import { colors } from '../theme/colors';
import { useWarmTabData } from '../hooks/useWarmTabData';

const PAYOUT_PER_HIRE = 22000;

/**
 * Earnings — the endorser's financial + reputation dashboard.
 *
 * Information architecture (top to bottom, density descending):
 *   1. HERO       — lifetime earnings, this month, pending (the ₹ story)
 *   2. SCORE      — compact reputation panel in the app's dark glass language
 *   3. PAYOUTS    — list of recent successful hires with amounts + dates
 *   4. LEADERBOARD — top 10 endorsers, viewer's row highlighted
 *
 * The Endorsement Score is NOT the star here; money is. The Score is a
 * reputation multiplier that appears secondary to the ₹ story.
 */
export function EarningsScreen() {
  const isFocused = useIsFocused();
  const hasLoadedRef = useRef(false);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutsExpanded, setPayoutsExpanded] = useState(true);

  const load = useCallback(() => {
    if (!hasLoadedRef.current) setLoading(true);
    Promise.all([
      referralsApi.getReputation(),
      referralsApi.getLeaderboard(),
    ])
      .then(([rep, lb]) => {
        setReputation(rep);
        setLeaderboard(lb);
        hasLoadedRef.current = true;
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load earnings data');
      })
      .finally(() => setLoading(false));
  }, []);

  useWarmTabData(load);

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
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
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
                animated={isFocused}
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

        {/* 2 · SCORE — dark glass reputation rail */}
        <ReputationRail score={reputation.endorsementScore} rank={rankPosition} />

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

        {/* 4 · LEADERBOARD — dark glass list */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Endorser Leaderboard</Text>
            <Text style={styles.sectionCount}>top 10</Text>
          </View>
          <DarkCard padded={false}>
            {leaderboard.length === 0 ? (
              <Text style={styles.leaderboardEmpty}>
                Leaderboard opens after the first Endorser ranks.
              </Text>
            ) : (
              leaderboard.slice(0, 10).map((entry, idx) => (
                <LeaderboardRow
                  key={entry.user.id}
                  rank={idx + 1}
                  entry={entry}
                  isViewer={entry.user.displayName === reputation.user.displayName}
                  isLast={idx === 9 || idx === leaderboard.length - 1}
                />
              ))
            )}
          </DarkCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  return (
    <View
      style={[
        styles.lbRow,
        isViewer && styles.lbRowYou,
        isLast && styles.lbRowLast,
      ]}
    >
      <Text style={styles.lbRank}>{`#${rank}`}</Text>
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
