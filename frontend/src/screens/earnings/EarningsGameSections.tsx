import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  ReduceMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '../../components/common/Avatar';
import { RollingNumber } from '../../components/common/RollingNumber';
import type { LeaderboardEntry } from '../../services/api';
import type { DemoPayout } from '../../config/demoWorld';
import { playSensoryEvent } from '../../utils/haptics';
import { earningsStyles as styles } from './earningsStyles';
import { formatINR, shortDate } from './earningsLogic';

interface ScoreArenaProps {
  score: number;
  rank: number;
  endorsements: number;
  hires: number;
}

export function ScoreArena(props: ScoreArenaProps): React.ReactElement {
  return (
    <View style={styles.scoreArena}>
      <ScoreHeader score={props.score} rank={props.rank} />
      <ScoreFacts
        endorsements={props.endorsements}
        hires={props.hires}
        rank={props.rank}
      />
      <ScoreRules />
    </View>
  );
}

export function RecentPayoutsSection({
  payouts,
}: {
  payouts: DemoPayout[];
}): React.ReactElement {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent payouts</Text>
        <Text style={styles.sectionCount}>{payouts.length} paid</Text>
      </View>
      {payouts.length === 0 ? (
        <DarkCard>
          <Text style={styles.emptyText}>
            No payouts yet. Confirmed hires will appear here automatically.
          </Text>
        </DarkCard>
      ) : (
        <DarkCard padded={false}>
          {payouts.map((payout, index) => (
            <PayoutRow
              key={payout.id}
              payout={payout}
              isLast={index === payouts.length - 1}
            />
          ))}
        </DarkCard>
      )}
    </View>
  );
}

export function LeaderboardSection({
  leaderboard,
  viewerName,
}: {
  leaderboard: LeaderboardEntry[];
  viewerName: string;
}): React.ReactElement {
  const rows = leaderboard.slice(0, 10);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Endorser leaderboard</Text>
        <Text style={styles.sectionCount}>season top 10</Text>
      </View>
      <View style={styles.creamCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.05)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creamSheen}
          pointerEvents="none"
        />
        {rows.length === 0 ? (
          <Text style={styles.leaderboardEmpty}>
            Leaderboard opens after the first Endorser ranks.
          </Text>
        ) : (
          rows.map((entry, index) => (
            <LeaderboardRow
              key={entry.user.id}
              rank={index + 1}
              entry={entry}
              isViewer={entry.user.displayName === viewerName}
              isLast={index === rows.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}

function ScoreHeader({
  score,
  rank,
}: {
  score: number;
  rank: number;
}): React.ReactElement {
  const animatedScore = useSharedValue(score);
  const previousScore = useRef(score);

  useEffect(() => {
    const previous = previousScore.current;
    if (previous !== score) {
      void playSensoryEvent('score.delta');
    }
    animatedScore.value = withTiming(score, {
      duration: 520,
      reduceMotion: ReduceMotion.System,
    });
    previousScore.current = score;
  }, [animatedScore, score]);

  return (
    <View style={styles.scoreTopRow}>
      <View>
        <Text style={styles.scoreLabel}>ENDORSEMENT SCORE</Text>
        <RollingNumber value={animatedScore} style={styles.scoreValue} />
        <Text style={styles.scoreCaption}>
          Reputation from accepted endorsements and confirmed hires
        </Text>
      </View>
      <RankPill rank={rank} />
    </View>
  );
}

function RankPill({ rank }: { rank: number }): React.ReactElement {
  return (
    <View style={styles.rankPill}>
      <Text style={styles.rankPillValue}>{rank > 0 ? `#${rank}` : '-'}</Text>
      <Text style={styles.rankPillLabel}>RANK</Text>
    </View>
  );
}

function ScoreFacts({
  endorsements,
  hires,
  rank,
}: {
  endorsements: number;
  hires: number;
  rank: number;
}): React.ReactElement {
  return (
    <View style={styles.scoreFacts}>
      <ScoreFact label="Endorsements" value={`${endorsements}`} />
      <View style={styles.scoreDivider} />
      <ScoreFact label="Confirmed hires" value={`${hires}`} />
      <View style={styles.scoreDivider} />
      <ScoreFact label="Season rank" value={rank > 0 ? `#${rank}` : '-'} />
    </View>
  );
}

function ScoreFact({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.scoreFact}>
      <Text style={styles.scoreFactValue}>{value}</Text>
      <Text style={styles.scoreFactLabel}>{label}</Text>
    </View>
  );
}

function ScoreRules(): React.ReactElement {
  return (
    <View style={styles.scoreRules}>
      <Text style={styles.scoreRulesLabel}>Score moves</Text>
      <Text style={styles.scoreRulesText}>+2 accepted · +10 hire · -1/wk idle</Text>
    </View>
  );
}

function DarkCard({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}): React.ReactElement {
  return (
    <View style={styles.darkCard}>
      <View style={padded ? styles.darkCardBody : undefined}>{children}</View>
    </View>
  );
}

function PayoutRow({
  payout,
  isLast,
}: {
  payout: DemoPayout;
  isLast?: boolean;
}): React.ReactElement {
  return (
    <View style={[styles.payoutRow, isLast && styles.rowLast]}>
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
}): React.ReactElement {
  return (
    <View style={[styles.lbRow, isViewer && styles.lbRowYou, isLast && styles.rowLast]}>
      <Text style={styles.lbRank}>{rankLabel(rank)}</Text>
      <Avatar displayName={entry.user.displayName} size="sm" />
      <View style={styles.lbMeta}>
        <Text style={styles.lbName} numberOfLines={1}>
          {entry.user.displayName}{isViewer ? ' · you' : ''}
        </Text>
        <Text style={styles.lbCompany} numberOfLines={1}>{entry.company.name}</Text>
      </View>
      <View style={styles.lbRight}>
        <Text style={styles.lbScore}>{entry.endorsementScore}</Text>
      </View>
    </View>
  );
}

function rankLabel(rank: number): string {
  return `#${rank}`;
}
