import { Dimensions } from 'react-native';
import { vec, type Transforms3d } from '@shopify/react-native-skia';
import {
  useDerivedValue,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { type GalaxyData, type StarNode } from '../../lib/constellation/buildGalaxy';
import { colors } from '../../theme/colors';

export const { width: W, height: H } = Dimensions.get('window');

export const NETWORK_COLORS = {
  ambientPrimary: colors.goldGlow,
  ambientSecondary: colors.ambientTeal,
  connectionCore: colors.pipelineAccepted,
  connectionGlow: colors.ambientTeal,
  connectionRing: colors.borderStrong,
  dust: colors.textSecondary,
  targetCore: colors.goldBright,
  targetGlow: colors.goldGlow,
  targetRing: colors.goldDim,
  pathActive: colors.goldDim,
  pathDormant: colors.border,
  selfCore: colors.cream,
  selfGlow: colors.goldGlow,
  selfMid: colors.goldDim,
  selfRing: colors.goldBright,
} as const;

export const DUST = [
  { id: 'd0', x: 0.14, y: 0.18, r: 1.4, depth: 0.35 },
  { id: 'd1', x: 0.32, y: 0.12, r: 1.1, depth: 0.25 },
  { id: 'd2', x: 0.72, y: 0.18, r: 1.6, depth: 0.45 },
  { id: 'd3', x: 0.86, y: 0.31, r: 1.0, depth: 0.25 },
  { id: 'd4', x: 0.12, y: 0.46, r: 1.2, depth: 0.35 },
  { id: 'd5', x: 0.29, y: 0.68, r: 1.5, depth: 0.55 },
  { id: 'd6', x: 0.52, y: 0.82, r: 1.0, depth: 0.35 },
  { id: 'd7', x: 0.78, y: 0.71, r: 1.7, depth: 0.55 },
  { id: 'd8', x: 0.91, y: 0.55, r: 1.2, depth: 0.45 },
  { id: 'd9', x: 0.45, y: 0.28, r: 0.9, depth: 0.25 },
] as const;

export type TiltValue = SharedValue<number>;
export type TiltTransform = DerivedValue<Transforms3d>;

export interface NodeGeometry {
  cx: number;
  cy: number;
  glowR: number;
  innerR: number;
  radius: number;
  ringR: number;
  satR: number;
  satX: number;
  satY: number;
}

export interface TiltTransformProps {
  depth: number;
  parallaxStrength: number;
  tiltX: TiltValue;
  tiltY: TiltValue;
  x: number;
  y: number;
}

export function nearestTarget(
  node: GalaxyData['connections'][number],
  targets: GalaxyData['targets'],
): GalaxyData['targets'][number] | null {
  if (targets.length === 0) return null;
  return targets.reduce((best, target) => {
    return distanceSquared(node, target) < distanceSquared(node, best) ? target : best;
  }, targets[0]);
}

export function nodeGeometry(
  node: GalaxyData['targets'][number],
  glowMultiplier: number,
): NodeGeometry {
  const radius = node.radius * (node.brightness > 0 ? node.brightness : 1);
  const cx = node.x * W;
  const cy = node.y * H;

  return {
    cx,
    cy,
    glowR: radius * glowMultiplier,
    innerR: Math.max(1.6, radius * 0.42),
    radius,
    ringR: radius * 1.95,
    satR: Math.max(1.4, radius * 0.32),
    satX: cx + radius * 1.5,
    satY: cy - radius * 1.25,
  };
}

export function point(node: Pick<StarNode, 'x' | 'y'>) {
  return vec(node.x * W, node.y * H);
}

export function useTiltTransform(props: TiltTransformProps): TiltTransform {
  return useDerivedValue<Transforms3d>(() => {
    const sideBias = (props.x - 0.5) * props.parallaxStrength * 0.16;
    const verticalBias = (props.y - 0.5) * props.parallaxStrength * 0.12;

    return [
      {
        translateX:
          props.tiltX.value * props.parallaxStrength * props.depth +
          props.tiltY.value * sideBias,
      },
      {
        translateY:
          props.tiltY.value * props.parallaxStrength * props.depth -
          props.tiltX.value * verticalBias,
      },
    ];
  });
}

function distanceSquared(
  a: GalaxyData['connections'][number],
  b: GalaxyData['targets'][number],
): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
