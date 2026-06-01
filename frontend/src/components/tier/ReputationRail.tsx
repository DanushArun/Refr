import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { DotMatrixField } from '../common/DotMatrixField';
import {
  buildReputationRailMetrics,
  formatTierTitle,
  type ReputationRailMetrics,
} from './reputationRailLogic';
import {
  MARKER_WIDTH,
  reputationRailStyles as styles,
} from './reputationRailStyles';

const MOTION_MS = 560;

interface ReputationRailProps {
  score: number;
  rank: number;
  style?: StyleProp<ViewStyle>;
}

export function ReputationRail({ score, rank, style }: ReputationRailProps): React.ReactElement {
  const metrics = buildReputationRailMetrics(score);
  const progress = useSharedValue(metrics.progress);
  const markerProgress = useSharedValue(metrics.markerProgress);

  useEffect(() => {
    progress.value = withTiming(metrics.progress, timingConfig);
    markerProgress.value = withTiming(metrics.markerProgress, timingConfig);
  }, [markerProgress, metrics.markerProgress, metrics.progress, progress]);

  return (
    <View style={[styles.card, style]}>
      <RailGlow />
      <RailHeader metrics={metrics} rank={rank} />
      <RailTrack
        score={score}
        metrics={metrics}
        progress={progress}
        markerProgress={markerProgress}
      />
      <RuleStrip />
    </View>
  );
}

const timingConfig = {
  duration: MOTION_MS,
  reduceMotion: ReduceMotion.System,
} as const;

function RailGlow(): React.ReactElement {
  return (
    <LinearGradient
      colors={['rgba(212,167,68,0.12)', 'rgba(255,255,255,0.035)', 'rgba(0,0,0,0)']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGlow}
      pointerEvents="none"
    />
  );
}

function RailHeader({
  metrics,
  rank,
}: {
  metrics: ReputationRailMetrics;
  rank: number;
}): React.ReactElement {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.eyebrow}>ENDORSEMENT SCORE</Text>
        <Text style={styles.title}>{formatTierTitle(metrics)}</Text>
      </View>
      <View style={styles.rankPill}>
        <Text style={styles.rankValue}>{rank > 0 ? `#${rank}` : '-'}</Text>
        <Text style={styles.rankLabel}>RANK</Text>
      </View>
    </View>
  );
}

function RailTrack({
  score,
  metrics,
  progress,
  markerProgress,
}: {
  score: number;
  metrics: ReputationRailMetrics;
  progress: SharedValue<number>;
  markerProgress: SharedValue<number>;
}): React.ReactElement {
  const [railWidth, setRailWidth] = useState(0);
  const onRailLayout = (event: LayoutChangeEvent): void => {
    setRailWidth(event.nativeEvent.layout.width);
  };
  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * railWidth,
  }));

  return (
    <View style={styles.railPanel}>
      <View style={styles.railField}>
        <DotMatrixField
          variant="progress"
          progress={metrics.progress}
          tone="dark"
          cellSize={9}
          dotRadius={0.85}
          style={styles.railSignalField}
        />
        <ScoreMarker score={score} railWidth={railWidth} markerProgress={markerProgress} />
        <View style={styles.railBase} onLayout={onRailLayout}>
          <Animated.View style={[styles.railFill, fillStyle]}>
            <LinearGradient
              colors={['#FFF3C4', colors.goldBright, colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fillGradient}
            />
          </Animated.View>
        </View>
      </View>
      <RailMeta metrics={metrics} />
    </View>
  );
}

function ScoreMarker({
  score,
  railWidth,
  markerProgress,
}: {
  score: number;
  railWidth: number;
  markerProgress: SharedValue<number>;
}): React.ReactElement {
  const markerStyle = useAnimatedStyle(() => ({
    opacity: railWidth > 0 ? 1 : 0,
    transform: [{ translateX: markerProgress.value * railWidth - MARKER_WIDTH / 2 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.marker, markerStyle]}>
      <View style={styles.markerCapsule}>
        <Text style={styles.markerValue}>{Math.round(score)}</Text>
      </View>
      <View style={styles.markerStem} />
      <View style={styles.markerFoot} />
    </Animated.View>
  );
}

function RailMeta({ metrics }: { metrics: ReputationRailMetrics }): React.ReactElement {
  const hint = metrics.isTopTier
    ? 'Top tier reached'
    : `${metrics.remaining} pts to ${metrics.nextTierName}`;

  return (
    <View style={styles.metaRow}>
      <BoundLabel label={metrics.currentTierName} value={String(metrics.lowerBound)} />
      <Text style={styles.metaHint}>{hint}</Text>
      <BoundLabel
        label={metrics.nextTierName ?? 'MAX'}
        value={formatUpperBound(metrics)}
        alignEnd
      />
    </View>
  );
}

function BoundLabel({
  label,
  value,
  alignEnd,
}: {
  label: string;
  value: string;
  alignEnd?: boolean;
}): React.ReactElement {
  return (
    <View style={[styles.bound, alignEnd && styles.boundEnd]}>
      <Text style={styles.boundValue}>{value}</Text>
      <Text style={styles.boundLabel}>{label}</Text>
    </View>
  );
}

function formatUpperBound(metrics: ReputationRailMetrics): string {
  return metrics.upperBound === null ? 'MAX' : String(metrics.upperBound);
}

function RuleStrip(): React.ReactElement {
  return (
    <View style={styles.ruleStrip}>
      <RuleChip label="Accepted" value="+2" tone="positive" />
      <RuleChip label="Hire" value="+10" tone="positive" />
      <RuleChip label="Idle" value="-1/wk" tone="negative" />
    </View>
  );
}

function RuleChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'positive' | 'negative';
}): React.ReactElement {
  const toneStyle = tone === 'positive' ? styles.rulePositive : styles.ruleNegative;

  return (
    <View style={styles.ruleChip}>
      <Text style={[styles.ruleValue, toneStyle]}>{value}</Text>
      <Text style={styles.ruleLabel}>{label}</Text>
    </View>
  );
}
