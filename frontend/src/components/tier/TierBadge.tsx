import React from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { tierForScore, type Tier } from './tiers';
import { colors } from '../../theme/colors';
import {
  TIER_BADGE_METRICS,
  type TierBadgeSize,
  tierBadgeLabel,
  tierStarRows,
} from './tierBadgeModel';

interface TierBadgeProps {
  /** Pass either score or a resolved tier. Score takes precedence. */
  score?: number;
  tier?: Tier;
  size?: 'sm' | 'md' | 'lg';
  /** Backwards-compatible prop; shield badges are always compact icons. */
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

type BadgeMetrics = (typeof TIER_BADGE_METRICS)[TierBadgeSize];

/**
 * Tier badge rendered as a shield: top plate, split dark body, and star count.
 * Used on swipe cards, profile, leaderboard, earnings hero.
 */
export function TierBadge({
  score,
  tier,
  size = 'md',
  iconOnly = false,
  style,
}: TierBadgeProps) {
  const resolved = tier ?? tierForScore(score ?? 0);
  const metrics = TIER_BADGE_METRICS[size];
  const totalHeight = metrics.bodyHeight + metrics.pointHeight;
  const starRows = tierStarRows(resolved.starCount);
  const pointBase = metrics.width / 2;
  const innerPointBase = pointBase - metrics.borderWidth * 2;

  return (
    <View
      accessible
      accessibilityLabel={`${resolved.name} tier`}
      style={[
        styles.root,
        { width: metrics.width, height: totalHeight },
        style,
      ]}
    >
      <ShieldBody tier={resolved} metrics={metrics} size={size} pointBase={pointBase} />
      <ShieldPoint metrics={metrics} pointBase={pointBase} color={resolved.color} />
      <ShieldPoint
        metrics={metrics}
        pointBase={innerPointBase}
        color={colors.surfaceInset}
        left={metrics.borderWidth * 2}
        inset
      />
    </View>
  );
}

function ShieldBody({
  tier,
  metrics,
  size,
  pointBase,
}: {
  tier: Tier;
  metrics: BadgeMetrics;
  size: TierBadgeSize;
  pointBase: number;
}): React.ReactElement {
  return (
    <View style={[styles.shieldBody, bodyFrameStyle(tier, metrics)]}>
      <View style={styles.leftFacet} />
      <View style={styles.rightFacet} />
      <View style={[styles.centerRidge, { backgroundColor: tier.color }]} />
      <TopPlate tier={tier} metrics={metrics} size={size} pointBase={pointBase} />
      <StarStack tier={tier} metrics={metrics} />
    </View>
  );
}

function TopPlate({
  tier,
  metrics,
  size,
  pointBase,
}: {
  tier: Tier;
  metrics: BadgeMetrics;
  size: TierBadgeSize;
  pointBase: number;
}): React.ReactElement {
  return (
    <>
      <View style={[styles.topPlate, plateStyle(tier, metrics)]}>
        <Text numberOfLines={1} style={[styles.plateLabel, plateLabelStyle(metrics)]}>
          {tierBadgeLabel(tier.name, size)}
        </Text>
      </View>
      <View style={[styles.plateFold, plateFoldStyle(tier, metrics, pointBase)]} />
    </>
  );
}

function StarStack({
  tier,
  metrics,
}: {
  tier: Tier;
  metrics: BadgeMetrics;
}): React.ReactElement {
  return (
    <View style={[styles.starStack, { top: metrics.starTopGap }]}>
      {tierStarRows(tier.starCount).map((stars, rowIndex) => (
        <View key={`${stars}-${rowIndex}`} style={styles.starRow}>
          {Array.from({ length: stars }, (_, starIndex) => (
            <Text key={`${rowIndex}-${starIndex}`} style={[styles.star, starStyle(tier, metrics)]}>
              ★
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function ShieldPoint({
  metrics,
  pointBase,
  color,
  left = 0,
  inset,
}: {
  metrics: BadgeMetrics;
  pointBase: number;
  color: string;
  left?: number;
  inset?: boolean;
}): React.ReactElement {
  const borderTopWidth = inset
    ? metrics.pointHeight - metrics.borderWidth * 2
    : metrics.pointHeight;

  return (
    <View
      style={[
        styles.point,
        {
          top: metrics.bodyHeight - metrics.borderWidth,
          left,
          borderLeftWidth: pointBase,
          borderRightWidth: pointBase,
          borderTopWidth,
          borderTopColor: color,
        },
      ]}
    />
  );
}

function bodyFrameStyle(tier: Tier, metrics: BadgeMetrics): ViewStyle {
  return {
    width: metrics.width,
    height: metrics.bodyHeight,
    borderColor: tier.color,
    borderTopLeftRadius: metrics.radius,
    borderTopRightRadius: metrics.radius,
    borderWidth: metrics.borderWidth,
  };
}

function plateStyle(tier: Tier, metrics: BadgeMetrics): ViewStyle {
  return {
    height: metrics.bandHeight,
    backgroundColor: tier.color,
  };
}

function plateLabelStyle(metrics: BadgeMetrics) {
  return {
    color: colors.background,
    fontSize: metrics.labelFont,
    lineHeight: metrics.bandHeight,
  };
}

function plateFoldStyle(tier: Tier, metrics: BadgeMetrics, pointBase: number): ViewStyle {
  return {
    top: metrics.bandHeight - 1,
    borderLeftWidth: pointBase,
    borderRightWidth: pointBase,
    borderTopWidth: Math.max(5, Math.round(metrics.bandHeight * 0.32)),
    borderTopColor: tier.color,
  };
}

function starStyle(tier: Tier, metrics: BadgeMetrics) {
  return {
    color: tier.color,
    fontSize: metrics.starFont,
    lineHeight: metrics.starFont + metrics.starGap,
  };
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    overflow: 'visible',
  },
  shieldBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    backgroundColor: colors.surfaceInset,
  },
  leftFacet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    backgroundColor: 'rgba(244, 237, 221, 0.055)',
  },
  rightFacet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  centerRidge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: StyleSheet.hairlineWidth,
    opacity: 0.18,
  },
  topPlate: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateFold: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.86,
  },
  plateLabel: {
    fontFamily: 'InstrumentSerif-Regular',
    letterSpacing: 0,
  },
  starStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 0,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  star: {
    fontFamily: 'Outfit-Bold',
    includeFontPadding: false,
  },
  point: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
