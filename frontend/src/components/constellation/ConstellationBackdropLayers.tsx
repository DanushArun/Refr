import React from 'react';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
} from '@shopify/react-native-skia';
import { type SharedValue } from 'react-native-reanimated';

import { type GalaxyData } from '../../lib/constellation/buildGalaxy';
import { colors } from '../../theme/colors';
import {
  DUST,
  H,
  NETWORK_COLORS,
  W,
  nearestTarget,
  nodeGeometry,
  point,
  useTiltTransform,
  type NodeGeometry,
  type TiltTransform,
  type TiltTransformProps,
  type TiltValue,
} from './ConstellationBackdropPrimitives';

interface SceneProps {
  backTransform: TiltTransform;
  data: GalaxyData;
  frontTransform: TiltTransform;
  midTransform: TiltTransform;
  parallaxStrength: number;
  pulse: SharedValue<number>;
  tiltX: TiltValue;
  tiltY: TiltValue;
}

export function ConstellationCanvas(props: SceneProps): React.ReactElement {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={props.backTransform}>
        <AmbientOrbs />
        <DustLayer {...props} />
      </Group>
      <Group transform={props.midTransform}>
        <MeshLayer galaxy={props.data} />
        <PathLayer galaxy={props.data} />
        <ConnectionNodes {...props} />
        <TargetNodes {...props} />
      </Group>
      <Group transform={props.frontTransform}>
        <SelfNode galaxy={props.data} pulse={props.pulse} />
      </Group>
    </Canvas>
  );
}

function AmbientOrbs(): React.ReactElement {
  return (
    <Group>
      <Circle cx={W * 0.18} cy={H * 0.22} r={150} color={NETWORK_COLORS.ambientPrimary}>
        <BlurMask blur={75} style="normal" />
      </Circle>
      <Circle cx={W * 0.85} cy={H * 0.78} r={130} color={NETWORK_COLORS.ambientSecondary}>
        <BlurMask blur={75} style="normal" />
      </Circle>
    </Group>
  );
}

function DustLayer(props: SceneProps): React.ReactElement {
  return (
    <Group>
      {DUST.map((dust) => (
        <DustPoint
          key={dust.id}
          depth={dust.depth}
          parallaxStrength={props.parallaxStrength}
          pulse={props.pulse}
          radius={dust.r}
          tiltX={props.tiltX}
          tiltY={props.tiltY}
          x={dust.x}
          y={dust.y}
        />
      ))}
    </Group>
  );
}

function DustPoint(props: DustPointProps): React.ReactElement {
  const transform = useTiltTransform(props);

  return (
    <Group transform={transform}>
      <Circle
        cx={props.x * W}
        cy={props.y * H}
        r={props.radius}
        color={NETWORK_COLORS.dust}
        opacity={props.pulse}
      />
    </Group>
  );
}

function MeshLayer({ galaxy }: { galaxy: GalaxyData }): React.ReactElement {
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

function PathLayer({ galaxy }: { galaxy: GalaxyData }): React.ReactElement {
  return (
    <Group>
      {galaxy.paths.map((path) => (
        <PathEdge galaxy={galaxy} key={`${path.fromId}-${path.toId}`} path={path} />
      ))}
    </Group>
  );
}

function PathEdge({ galaxy, path }: PathEdgeProps): React.ReactElement | null {
  const target = galaxy.targets.find((node) => node.id === path.toId);
  if (!target) return null;

  return (
    <Group>
      {path.activated && <PathGlow from={galaxy.self} to={target} />}
      <Line
        p1={point(galaxy.self)}
        p2={point(target)}
        color={path.activated ? NETWORK_COLORS.pathActive : NETWORK_COLORS.pathDormant}
        style="stroke"
        strokeWidth={path.activated ? 1.35 : 0.65}
      />
    </Group>
  );
}

function PathGlow({ from, to }: NodePair): React.ReactElement {
  return (
    <Line
      p1={point(from)}
      p2={point(to)}
      color={NETWORK_COLORS.pathActive}
      style="stroke"
      strokeWidth={5}
    >
      <BlurMask blur={9} style="solid" />
    </Line>
  );
}

function MeshLine({ from, subtle = false, to }: MeshLineProps): React.ReactElement {
  return (
    <Line
      p1={point(from)}
      p2={point(to)}
      color={subtle ? colors.surfaceHover : colors.border}
      style="stroke"
      strokeWidth={subtle ? 0.45 : 0.55}
    />
  );
}

function ConnectionNodes(props: SceneProps): React.ReactElement {
  return (
    <NodeLayer
      {...props}
      coreColor={NETWORK_COLORS.connectionCore}
      glowColor={NETWORK_COLORS.connectionGlow}
      glowMultiplier={2.4}
      nodes={props.data.connections}
      ringColor={NETWORK_COLORS.connectionRing}
      tiltDepth={0.22}
    />
  );
}

function TargetNodes(props: SceneProps): React.ReactElement {
  return (
    <NodeLayer
      {...props}
      coreColor={NETWORK_COLORS.targetCore}
      glowColor={NETWORK_COLORS.targetGlow}
      glowMultiplier={2.8}
      nodes={props.data.targets}
      ringColor={NETWORK_COLORS.targetRing}
      tiltDepth={0.34}
    />
  );
}

function NodeLayer(props: NodeLayerProps): React.ReactElement {
  return (
    <Group>
      {props.nodes.map((node) => (
        <ReactiveNode key={node.id} node={node} {...props} />
      ))}
    </Group>
  );
}

function ReactiveNode({ node, ...props }: ReactiveNodeProps): React.ReactElement {
  const transform = useTiltTransform({
    depth: props.tiltDepth,
    parallaxStrength: props.parallaxStrength,
    tiltX: props.tiltX,
    tiltY: props.tiltY,
    x: node.x,
    y: node.y,
  });
  const geometry = nodeGeometry(node, props.glowMultiplier);

  return (
    <Group transform={transform}>
      <NodeHalo {...geometry} {...props} />
      <NodeCore {...geometry} coreColor={props.coreColor} />
    </Group>
  );
}

function NodeHalo(props: NodeHaloProps): React.ReactElement {
  return (
    <>
      <Circle
        cx={props.cx}
        cy={props.cy}
        r={props.glowR}
        color={props.glowColor}
        opacity={props.pulse}
      >
        <BlurMask blur={12} style="solid" />
      </Circle>
      <Circle
        cx={props.cx}
        cy={props.cy}
        r={props.ringR}
        color={props.ringColor}
        style="stroke"
        strokeWidth={0.9}
      />
      <Circle cx={props.satX} cy={props.satY} r={props.satR} color={NETWORK_COLORS.selfCore} />
    </>
  );
}

function NodeCore({ coreColor, cx, cy, innerR, radius }: NodeCoreProps): React.ReactElement {
  return (
    <>
      <Circle cx={cx} cy={cy} r={radius} color={coreColor} />
      <Circle cx={cx} cy={cy} r={innerR} color={colors.navyDeep} />
    </>
  );
}

function SelfNode({ galaxy, pulse }: SelfNodeProps): React.ReactElement {
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

interface DustPointProps extends TiltTransformProps {
  pulse: SharedValue<number>;
  radius: number;
}

interface MeshLineProps extends NodePair {
  subtle?: boolean;
}

interface NodePair {
  from: GalaxyData['self'] | GalaxyData['targets'][number];
  to: GalaxyData['targets'][number];
}

interface PathEdgeProps {
  galaxy: GalaxyData;
  path: GalaxyData['paths'][number];
}

interface NodeLayerProps extends ReactiveNodeBaseProps {
  nodes: GalaxyData['targets'];
}

interface ReactiveNodeProps extends ReactiveNodeBaseProps {
  node: GalaxyData['targets'][number];
}

interface ReactiveNodeBaseProps {
  coreColor: string;
  glowColor: string;
  glowMultiplier: number;
  parallaxStrength: number;
  pulse: SharedValue<number>;
  ringColor: string;
  tiltDepth: number;
  tiltX: TiltValue;
  tiltY: TiltValue;
}

interface NodeHaloProps extends NodeGeometry {
  glowColor: string;
  pulse: SharedValue<number>;
  ringColor: string;
}

interface NodeCoreProps {
  coreColor: string;
  cx: number;
  cy: number;
  innerR: number;
  radius: number;
}

interface SelfNodeProps {
  galaxy: GalaxyData;
  pulse: SharedValue<number>;
}
