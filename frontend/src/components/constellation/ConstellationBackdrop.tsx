import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { type GalaxyData } from '../../lib/constellation/buildGalaxy';
import { getDemoGalaxy } from './demoGalaxy';
import { useDeviceTilt } from '../../hooks/useDeviceTilt';
import { colors } from '../../theme/colors';

const { width: W, height: H } = Dimensions.get('window');

const NETWORK_COLORS = {
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

const DUST = [
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

interface Props {
  galaxy?: GalaxyData;
  /** When true, stars subtly pulse on a slow loop for a "living" feel */
  alive?: boolean;
  /** Maximum parallax offset in pixels per axis at full tilt */
  parallaxStrength?: number;
  /**
   * When true, backdrop is shown at full opacity. When false, backdrop is
   * hidden (opacity 0). Transitions are timed: 1200ms fade-in, 600ms fade-out.
   * Defaults to true so existing callers keep their always-on behavior.
   */
  visible?: boolean;
  active?: boolean;
}

/**
 * Full-screen constellation backdrop. Combines:
 *  - data-driven star field from buildGalaxy()
 *  - gyroscope parallax (3 depth layers drift independently)
 *  - slow breath pulse on glows
 *
 * Replaces the AmbientBackground on marquee screens (Welcome, Discover).
 */
export function ConstellationBackdrop({
  galaxy,
  alive = true,
  parallaxStrength = 24,
  visible = true,
  active = true,
}: Props) {
  const data = useMemo(() => galaxy ?? getDemoGalaxy(), [galaxy]);

  const pulse = useSharedValue(1);
  // Initial opacity matches the initial visible value so the very first paint
  // doesn't flash the backdrop in/out before the effect runs.
  const opacity = useSharedValue(visible ? 1 : 0);

  // We KEEP THE CANVAS UNMOUNTED whenever the backdrop is invisible. Without
  // this, the heavy Skia tree (5+ blurred circles + parallax) was painting
  // every frame at opacity:0 during normal swiping, which is the bulk of the
  // perf cost on Discover. We only mount during the visible window plus a
  // short tail to let the fade-out complete cleanly.
  const [shouldRender, setShouldRender] = useState(visible);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tiltX, tiltY } = useDeviceTilt(active && shouldRender);

  useEffect(() => {
    if (visible) {
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = null;
      }
      setShouldRender(true);
    } else if (shouldRender) {
      // Wait for the 600ms fade-out before unmounting the Canvas.
      fadeOutTimerRef.current = setTimeout(() => {
        setShouldRender(false);
        fadeOutTimerRef.current = null;
      }, 650);
    }
    return () => {
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
  }, [visible, shouldRender]);

  // Pulse animation only runs while the backdrop is rendered — saves UI-thread
  // work during normal swiping when the Canvas is unmounted anyway.
  useEffect(() => {
    if (!alive || !shouldRender || !active) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.96, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [active, alive, pulse, shouldRender]);

  // Drive the wrapper opacity from the `visible` prop. Fade in is slower
  // (1200ms) so the empty state reveal feels deliberate; fade out is faster
  // (600ms) so refreshing the queue gets back to the deck quickly.
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 1200 : 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Three parallax layers — back (gentle), mid (medium), front (most reactive).
  // Skia's `transform` prop on Group needs a single derived value containing the
  // full transform array, not separate derived numbers per axis.
  const backTransform = useDerivedValue(() => [
    { translateX: tiltX.value * parallaxStrength * 0.3 },
    { translateY: tiltY.value * parallaxStrength * 0.3 },
  ]);
  const midTransform = useDerivedValue(() => [
    { translateX: tiltX.value * parallaxStrength * 0.7 },
    { translateY: tiltY.value * parallaxStrength * 0.7 },
  ]);
  const frontTransform = useDerivedValue(() => [
    { translateX: tiltX.value * parallaxStrength * 1.2 },
    { translateY: tiltY.value * parallaxStrength * 1.2 },
  ]);

  if (!shouldRender) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* The aurora itself is mounted globally in app/_layout.tsx so it
          stays consistent across every route. This component now only owns
          the constellation network (orbs, paths, stars), which fades in/out
          per the `visible` prop. */}
      <Animated.View style={[StyleSheet.absoluteFillObject, fadeStyle]} pointerEvents="none">
        <Canvas style={StyleSheet.absoluteFillObject}>
          {/* BACK LAYER — distant ambient orbs (slowest parallax) */}
          <Group transform={backTransform}>
            <Circle cx={W * 0.18} cy={H * 0.22} r={150} color={NETWORK_COLORS.ambientPrimary}>
              <BlurMask blur={75} style="normal" />
            </Circle>
            <Circle cx={W * 0.85} cy={H * 0.78} r={130} color={NETWORK_COLORS.ambientSecondary}>
              <BlurMask blur={75} style="normal" />
            </Circle>
            <DustLayer
              parallaxStrength={parallaxStrength}
              pulse={pulse}
              tiltX={tiltX}
              tiltY={tiltY}
            />
          </Group>

          {/* MID LAYER — paths + connections (medium parallax) */}
          <Group transform={midTransform}>
            <MeshLayer galaxy={data} />
            <PathLayer galaxy={data} />
            <NodeLayer
              nodes={data.connections}
              coreColor={NETWORK_COLORS.connectionCore}
              glowColor={NETWORK_COLORS.connectionGlow}
              glowMultiplier={2.4}
              parallaxStrength={parallaxStrength}
              ringColor={NETWORK_COLORS.connectionRing}
              pulse={pulse}
              tiltDepth={0.22}
              tiltX={tiltX}
              tiltY={tiltY}
            />
            <NodeLayer
              nodes={data.targets}
              coreColor={NETWORK_COLORS.targetCore}
              glowColor={NETWORK_COLORS.targetGlow}
              glowMultiplier={2.8}
              parallaxStrength={parallaxStrength}
              ringColor={NETWORK_COLORS.targetRing}
              pulse={pulse}
              tiltDepth={0.34}
              tiltX={tiltX}
              tiltY={tiltY}
            />
          </Group>

          {/* FRONT LAYER — self star (most reactive parallax) */}
          <Group transform={frontTransform}>
            <SelfNode galaxy={data} pulse={pulse} />
          </Group>
        </Canvas>
      </Animated.View>
    </View>
  );
}

function DustLayer({
  parallaxStrength,
  pulse,
  tiltX,
  tiltY,
}: {
  parallaxStrength: number;
  pulse: SharedValue<number>;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}) {
  return (
    <Group>
      {DUST.map((dust) => (
        <DustPoint
          key={dust.id}
          depth={dust.depth}
          parallaxStrength={parallaxStrength}
          pulse={pulse}
          radius={dust.r}
          tiltX={tiltX}
          tiltY={tiltY}
          x={dust.x}
          y={dust.y}
        />
      ))}
    </Group>
  );
}

function DustPoint({
  depth,
  parallaxStrength,
  pulse,
  radius,
  tiltX,
  tiltY,
  x,
  y,
}: {
  depth: number;
  parallaxStrength: number;
  pulse: SharedValue<number>;
  radius: number;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
  x: number;
  y: number;
}) {
  const transform = useTiltTransform({ depth, parallaxStrength, tiltX, tiltY, x, y });

  return (
    <Group transform={transform}>
      <Circle cx={x * W} cy={y * H} r={radius} color={NETWORK_COLORS.dust} opacity={pulse} />
    </Group>
  );
}

function MeshLayer({ galaxy }: { galaxy: GalaxyData }) {
  return (
    <Group>
      {galaxy.connections.map((connection) => {
        const target = nearestTarget(connection, galaxy.targets);
        if (!target) return null;
        return <MeshLine from={connection} key={connection.id} to={target} />;
      })}
      {galaxy.connections.slice(1).map((connection, index) => (
        <MeshLine
          from={galaxy.connections[index]}
          key={`${galaxy.connections[index].id}-${connection.id}`}
          subtle
          to={connection}
        />
      ))}
    </Group>
  );
}

function PathLayer({ galaxy }: { galaxy: GalaxyData }) {
  return (
    <Group>
      {galaxy.paths.map((p) => {
        const from = galaxy.self;
        const to = galaxy.targets.find((t) => t.id === p.toId);
        if (!to) return null;
        return (
          <Group key={`${p.fromId}-${p.toId}`}>
            {p.activated && (
              <Line
                p1={vec(from.x * W, from.y * H)}
                p2={vec(to.x * W, to.y * H)}
                color={NETWORK_COLORS.pathActive}
                style="stroke"
                strokeWidth={5}
              >
                <BlurMask blur={9} style="solid" />
              </Line>
            )}
            <Line
              p1={vec(from.x * W, from.y * H)}
              p2={vec(to.x * W, to.y * H)}
              color={p.activated ? NETWORK_COLORS.pathActive : NETWORK_COLORS.pathDormant}
              style="stroke"
              strokeWidth={p.activated ? 1.35 : 0.65}
            />
          </Group>
        );
      })}
    </Group>
  );
}

function MeshLine({
  from,
  subtle = false,
  to,
}: {
  from: GalaxyData['connections'][number];
  subtle?: boolean;
  to: GalaxyData['targets'][number];
}) {
  return (
    <Line
      p1={vec(from.x * W, from.y * H)}
      p2={vec(to.x * W, to.y * H)}
      color={subtle ? colors.surfaceHover : colors.border}
      style="stroke"
      strokeWidth={subtle ? 0.45 : 0.55}
    />
  );
}

interface NodeLayerProps {
  nodes: GalaxyData['targets'];
  coreColor: string;
  glowColor: string;
  glowMultiplier: number;
  parallaxStrength: number;
  ringColor: string;
  pulse: SharedValue<number>;
  tiltDepth: number;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}

function NodeLayer({
  nodes,
  coreColor,
  glowColor,
  glowMultiplier,
  parallaxStrength,
  pulse,
  ringColor,
  tiltDepth,
  tiltX,
  tiltY,
}: NodeLayerProps) {
  return (
    <Group>
      {nodes.map((node) => (
        <ReactiveNode
          coreColor={coreColor}
          glowColor={glowColor}
          glowMultiplier={glowMultiplier}
          key={node.id}
          node={node}
          parallaxStrength={parallaxStrength}
          pulse={pulse}
          ringColor={ringColor}
          tiltDepth={tiltDepth}
          tiltX={tiltX}
          tiltY={tiltY}
        />
      ))}
    </Group>
  );
}

function ReactiveNode({
  coreColor,
  glowColor,
  glowMultiplier,
  node,
  parallaxStrength,
  pulse,
  ringColor,
  tiltDepth,
  tiltX,
  tiltY,
}: {
  coreColor: string;
  glowColor: string;
  glowMultiplier: number;
  node: GalaxyData['targets'][number];
  parallaxStrength: number;
  pulse: SharedValue<number>;
  ringColor: string;
  tiltDepth: number;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}) {
  const cx = node.x * W;
  const cy = node.y * H;
  const baseR = node.radius * (node.brightness > 0 ? node.brightness : 1);
  const transform = useTiltTransform({
    depth: tiltDepth,
    parallaxStrength,
    tiltX,
    tiltY,
    x: node.x,
    y: node.y,
  });

  return (
    <Group transform={transform}>
      <Circle cx={cx} cy={cy} r={baseR * glowMultiplier} color={glowColor} opacity={pulse}>
        <BlurMask blur={12} style="solid" />
      </Circle>
      <Circle
        cx={cx}
        cy={cy}
        r={baseR * 1.95}
        color={ringColor}
        style="stroke"
        strokeWidth={0.9}
      />
      <Circle
        cx={cx + baseR * 1.5}
        cy={cy - baseR * 1.25}
        r={Math.max(1.4, baseR * 0.32)}
        color={NETWORK_COLORS.selfCore}
      />
      <Circle cx={cx} cy={cy} r={baseR} color={coreColor} />
      <Circle cx={cx} cy={cy} r={Math.max(1.6, baseR * 0.42)} color={colors.navyDeep} />
    </Group>
  );
}

function SelfNode({ galaxy, pulse }: { galaxy: GalaxyData; pulse: SharedValue<number> }) {
  const cx = galaxy.self.x * W;
  const cy = galaxy.self.y * H;
  const r = galaxy.self.radius;
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r * 5.4} color={NETWORK_COLORS.selfGlow} opacity={pulse}>
        <BlurMask blur={28} style="solid" />
      </Circle>
      <Circle cx={cx} cy={cy} r={r * 3.2} color={NETWORK_COLORS.selfMid}>
        <BlurMask blur={6} style="solid" />
      </Circle>
      <Circle
        cx={cx}
        cy={cy}
        r={r * 2.35}
        color={NETWORK_COLORS.selfRing}
        opacity={pulse}
        style="stroke"
        strokeWidth={1.1}
      />
      <Circle cx={cx} cy={cy} r={r * 1.5} color={colors.navyDeep} />
      <Circle cx={cx} cy={cy} r={r} color={NETWORK_COLORS.selfCore} />
    </Group>
  );
}

function nearestTarget(
  node: GalaxyData['connections'][number],
  targets: GalaxyData['targets'],
): GalaxyData['targets'][number] | null {
  if (targets.length === 0) return null;
  return targets.reduce((best, target) => {
    return distanceSquared(node, target) < distanceSquared(node, best) ? target : best;
  }, targets[0]);
}

function distanceSquared(
  a: GalaxyData['connections'][number],
  b: GalaxyData['targets'][number],
): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function useTiltTransform({
  depth,
  parallaxStrength,
  tiltX,
  tiltY,
  x,
  y,
}: {
  depth: number;
  parallaxStrength: number;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
  x: number;
  y: number;
}) {
  return useDerivedValue(() => {
    const sideBias = (x - 0.5) * parallaxStrength * 0.16;
    const verticalBias = (y - 0.5) * parallaxStrength * 0.12;

    return [
      { translateX: tiltX.value * parallaxStrength * depth + tiltY.value * sideBias },
      { translateY: tiltY.value * parallaxStrength * depth - tiltX.value * verticalBias },
    ];
  });
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
