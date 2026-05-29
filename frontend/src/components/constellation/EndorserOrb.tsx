import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';

interface EndorserOrbProps {
  /** Endorsement / Trust score, 0..100 — drives node count + max brightness. */
  score: number;
  /** Confirmed hires — boost the firing rate (more action in the network). */
  hires: number;
  /** In-flight referrals — adds extra peripheral nodes pulsing on the rim. */
  active: number;
  size?: number;
  showLabel?: boolean;
  animated?: boolean;
}

interface Node {
  x: number; // unit-disk coords (-1..1)
  y: number;
  phase: number; // 0..1, when this node peaks in the firing cycle
}

interface Edge {
  a: number;
  b: number;
}

const CYCLE_MS = 4200; // full firing cycle
const FRAME_MS = 33; // ~30 fps re-render
const PI = Math.PI;
const GOLDEN_ANGLE = PI * (3 - Math.sqrt(5));

/**
 * Endorser Orb — a small neuron network whose density and firing rate
 * encode the endorser's reputation.
 *
 *   - Node count scales with score (sparser at low scores, denser at high)
 *   - Each node fires on a phase-offset gaussian schedule so the network
 *     reads as continuously alive rather than blinking in unison
 *   - Edges connect each node to its 2 nearest neighbours and light up
 *     when either endpoint fires — propagation reads as a thought passing
 *     across the synapse
 *   - Hires increase peak brightness (the network has stronger signals)
 *   - Active referrals add a peripheral ring of fast-pulse "in flight" nodes
 */
export function EndorserOrb({
  score,
  hires,
  active,
  size = 220,
  showLabel = true,
  animated = true,
}: EndorserOrbProps) {
  const haloPad = Math.ceil(size * 0.10);
  const canvasSize = size + haloPad * 2;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const networkR = size * 0.42;

  const nodeCount = clamp(Math.round(7 + score / 12), 7, 16);
  const peripheralCount = clamp(active, 0, 8);

  const nodes = useMemo(
    () => buildNodes(nodeCount, score),
    [nodeCount, score],
  );
  const edges = useMemo(() => buildEdges(nodes), [nodes]);
  const peripherals = useMemo(
    () => buildPeripherals(peripheralCount),
    [peripheralCount],
  );

  // Hire-driven boost: more hires push the network's peak intensity higher
  // and shorten the firing pulse so it feels snappier.
  const hireBoost = Math.min(1, hires / 12);
  const peakIntensity = 0.95 + hireBoost * 0.05;
  const pulseSharpness = 22 + hireBoost * 16;

  // 30 fps tick driving a single time variable. Re-rendering ~30 small Skia
  // primitives per frame is well within budget on any modern device.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!animated) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), FRAME_MS);
    return () => clearInterval(id);
  }, [animated]);

  const t = (now % CYCLE_MS) / CYCLE_MS; // 0..1

  // Per-node brightness: gaussian centred on each node's phase, wrapping
  // around the cycle so intensity is continuous, not a sawtooth.
  const nodeBrightness = nodes.map((n) => {
    const dist = wrappedDist(t, n.phase);
    return Math.exp(-dist * dist * pulseSharpness) * peakIntensity;
  });

  // Active-referral peripherals fire at 2.5× the network rate.
  const activeT = (now % (CYCLE_MS / 2.5)) / (CYCLE_MS / 2.5);
  const activeBright = peripherals.map((p) => {
    const dist = wrappedDist(activeT, p.phase);
    return Math.exp(-dist * dist * 32) * 0.95;
  });

  const strokeW = Math.max(0.9, size * 0.014);
  const dotR = Math.max(1.6, size * 0.024);
  const haloR = Math.max(2.6, size * 0.038);

  return (
    <View
      style={{
        width: canvasSize,
        height: canvasSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Warm gold ambient — the network sits in a soft amber glow */}
        <Circle cx={cx} cy={cy} r={networkR + size * 0.10} color="rgba(255, 196, 84, 0.28)">
          <BlurMask blur={size * 0.20} style="solid" />
        </Circle>

        {/* Edges — pale gold strokes, visible at rest, brighter when firing */}
        <Group>
          {edges.map((e, i) => {
            const lit = Math.max(nodeBrightness[e.a], nodeBrightness[e.b]);
            const opacity = 0.35 + lit * 0.55;
            const a = nodes[e.a];
            const b = nodes[e.b];
            return (
              <Line
                key={`edge-${i}`}
                p1={vec(cx + a.x * networkR, cy + a.y * networkR)}
                p2={vec(cx + b.x * networkR, cy + b.y * networkR)}
                color={`rgba(255, 226, 150, ${opacity})`}
                style="stroke"
                strokeWidth={strokeW}
                strokeCap="round"
              >
                <BlurMask blur={Math.max(0.6, size * 0.005)} style="solid" />
              </Line>
            );
          })}
        </Group>

        {/* Hire rays — permanent gold spokes (thin, behind the firing nodes) */}
        <Group>
          {Array.from({ length: Math.min(hires, 12) }).map((_, i) => {
            const angle = (i / Math.max(Math.min(hires, 12), 1)) * PI * 2;
            const inner = networkR + size * 0.04;
            const outer = networkR + size * 0.10;
            return (
              <Line
                key={`ray-${i}`}
                p1={vec(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)}
                p2={vec(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)}
                color="rgba(255, 248, 220, 0.92)"
                style="stroke"
                strokeWidth={Math.max(1, size * 0.012)}
                strokeCap="round"
              >
                <BlurMask blur={Math.max(1, size * 0.008)} style="solid" />
              </Line>
            );
          })}
        </Group>

        {/* Nodes — warm gold halo + bright white-gold core */}
        <Group>
          {nodes.map((n, i) => {
            const b = nodeBrightness[i];
            const px = cx + n.x * networkR;
            const py = cy + n.y * networkR;
            return (
              <Group key={`node-${i}`}>
                {/* Wide outer glow — amber, only blooms at firing peak */}
                <Circle
                  cx={px}
                  cy={py}
                  r={haloR * 1.8 + b * size * 0.025}
                  color={`rgba(255, 196, 84, ${0.15 + b * 0.50})`}
                >
                  <BlurMask blur={size * 0.07} style="solid" />
                </Circle>
                {/* Inner halo — pale gold, always visible, intensifies on fire */}
                <Circle
                  cx={px}
                  cy={py}
                  r={haloR + b * size * 0.020}
                  color={`rgba(255, 220, 130, ${0.55 + b * 0.40})`}
                >
                  <BlurMask blur={size * 0.04} style="solid" />
                </Circle>
                {/* Solid core — luminous white-gold, always crisp */}
                <Circle
                  cx={px}
                  cy={py}
                  r={dotR + b * size * 0.012}
                  color={`rgba(255, 248, 220, ${0.90 + b * 0.10})`}
                />
              </Group>
            );
          })}
        </Group>

        {/* Active referrals — brighter, faster gold pulses on the outer ring */}
        <Group>
          {peripherals.map((p, i) => {
            const b = activeBright[i];
            const ringR = networkR + size * 0.07;
            const px = cx + Math.cos(p.angle) * ringR;
            const py = cy + Math.sin(p.angle) * ringR;
            return (
              <Group key={`active-${i}`}>
                <Circle
                  cx={px}
                  cy={py}
                  r={dotR * 1.4 + b * size * 0.014}
                  color={`rgba(255, 220, 130, ${0.45 + b * 0.50})`}
                >
                  <BlurMask blur={size * 0.05} style="solid" />
                </Circle>
                <Circle
                  cx={px}
                  cy={py}
                  r={dotR * 0.85}
                  color={`rgba(255, 248, 220, ${0.85 + b * 0.15})`}
                />
              </Group>
            );
          })}
        </Group>
      </Canvas>

      {showLabel && (
        <View style={styles.labelOverlay} pointerEvents="none">
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.label}>ENDORSEMENT</Text>
        </View>
      )}
    </View>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Cyclic distance on the unit circle: distance between two phases in [0, 1)
// such that 0.05 and 0.95 are treated as 0.10 apart, not 0.90.
function wrappedDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

// Golden-angle spiral within the unit disk so nodes distribute evenly.
// Phase offset is a deterministic permutation of 0..1 keyed on score so
// nodes don't fire in spatial order (which would look like a sweeping
// wavefront instead of independent neurons).
function buildNodes(count: number, score: number): Node[] {
  const seedRot = ((score * 31) % 360) * (PI / 180);
  return Array.from({ length: count }, (_, i) => {
    const u = (i + 0.5) / count;
    const r = Math.sqrt(u) * 0.92;
    const θ = i * GOLDEN_ANGLE + seedRot;
    // Permute phases via the golden-ratio fraction so the firing order is
    // visually decoupled from spatial position.
    const phase = ((i * 0.6180339887 + (score % 17) * 0.073) % 1 + 1) % 1;
    return { x: Math.cos(θ) * r, y: Math.sin(θ) * r, phase };
  });
}

// k-nearest-neighbour graph (k=2). Deduplicates edges so the network is an
// undirected graph with each node connecting to at least its two closest
// peers — gives a sparse connected look without crossings everywhere.
function buildEdges(nodes: Node[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const others = nodes
      .map((n, j) => ({
        j,
        d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y),
      }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(2, others.length); k++) {
      const lo = Math.min(i, others[k].j);
      const hi = Math.max(i, others[k].j);
      const key = `${lo}-${hi}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ a: lo, b: hi });
      }
    }
  }
  return edges;
}

// Outer-ring nodes for in-flight referrals — evenly spaced around the
// network with phase offsets so they don't strobe in unison.
function buildPeripherals(count: number): { angle: number; phase: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / Math.max(count, 1)) * PI * 2 - PI / 2,
    phase: ((i * 0.382) % 1 + 1) % 1,
  }));
}

const styles = StyleSheet.create({
  labelOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 30,
    color: '#0a0a0b',
    letterSpacing: -1,
  },
  label: {
    fontFamily: 'Outfit-Bold',
    fontSize: 8,
    color: 'rgba(10, 10, 11, 0.6)',
    letterSpacing: 2,
    marginTop: 2,
  },
});
