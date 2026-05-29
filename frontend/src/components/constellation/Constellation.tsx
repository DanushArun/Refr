import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';
import { type GalaxyData } from '../../lib/constellation/buildGalaxy';

interface ConstellationProps {
  galaxy: GalaxyData;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** Tilt offset in pixels for parallax — animate this from a gyroscope hook */
  tiltX?: number;
  tiltY?: number;
}

const COLORS = {
  self: 'rgba(0, 255, 204, 1)',
  selfGlow: 'rgba(0, 255, 204, 0.45)',
  target: 'rgba(167, 139, 250, 1)',
  targetGlow: 'rgba(167, 139, 250, 0.55)',
  connection: 'rgba(96, 165, 250, 1)',
  connectionGlow: 'rgba(96, 165, 250, 0.45)',
  pathActive: 'rgba(0, 255, 204, 0.45)',
  pathDormant: 'rgba(255, 255, 255, 0.08)',
};

export function Constellation({
  galaxy,
  width,
  height,
  style,
  tiltX = 0,
  tiltY = 0,
}: ConstellationProps) {
  // Project normalized 0..1 coordinates onto the canvas, with parallax offset
  const project = useMemo(() => {
    return (x: number, y: number, depth: number) => ({
      x: x * width + tiltX * depth,
      y: y * height + tiltY * depth,
    });
  }, [width, height, tiltX, tiltY]);

  const allNodes = useMemo(() => {
    return [galaxy.self, ...galaxy.targets, ...galaxy.connections];
  }, [galaxy]);

  const nodeById = useMemo(() => {
    const m = new Map<string, (typeof allNodes)[number]>();
    for (const n of allNodes) m.set(n.id, n);
    return m;
  }, [allNodes]);

  return (
    <View style={[styles.container, { width, height }, style]} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* Path layer (rendered first so stars sit on top) */}
        <Group>
          {galaxy.paths.map((p) => {
            const from = nodeById.get(p.fromId);
            const to = nodeById.get(p.toId);
            if (!from || !to) return null;
            const f = project(from.x, from.y, 0.2);
            const t = project(to.x, to.y, 0.6);
            return (
              <Line
                key={`${p.fromId}-${p.toId}`}
                p1={vec(f.x, f.y)}
                p2={vec(t.x, t.y)}
                color={p.activated ? COLORS.pathActive : COLORS.pathDormant}
                style="stroke"
                strokeWidth={p.activated ? 1.2 : 0.6}
              >
                {p.activated && <BlurMask blur={2} style="solid" />}
              </Line>
            );
          })}
        </Group>

        {/* Connection nodes — mid ring */}
        <Group>
          {galaxy.connections.map((c) => {
            const p = project(c.x, c.y, 0.8);
            return (
              <Group key={c.id}>
                {/* Soft glow halo */}
                <Circle cx={p.x} cy={p.y} r={c.radius * 2.2} color={COLORS.connectionGlow}>
                  <BlurMask blur={10} style="solid" />
                </Circle>
                {/* Hard core */}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={c.radius * c.brightness}
                  color={COLORS.connection}
                />
              </Group>
            );
          })}
        </Group>

        {/* Target nodes — outer ring */}
        <Group>
          {galaxy.targets.map((t) => {
            const p = project(t.x, t.y, 0.6);
            return (
              <Group key={t.id}>
                <Circle cx={p.x} cy={p.y} r={t.radius * 2.5} color={COLORS.targetGlow}>
                  <BlurMask blur={14} style="solid" />
                </Circle>
                <Circle cx={p.x} cy={p.y} r={t.radius} color={COLORS.target} />
              </Group>
            );
          })}
        </Group>

        {/* Self node — the heart */}
        <Group>
          {(() => {
            const p = project(galaxy.self.x, galaxy.self.y, 0.05);
            return (
              <>
                <Circle cx={p.x} cy={p.y} r={galaxy.self.radius * 3.2} color={COLORS.selfGlow}>
                  <BlurMask blur={20} style="solid" />
                </Circle>
                <Circle cx={p.x} cy={p.y} r={galaxy.self.radius * 1.8} color={COLORS.selfGlow}>
                  <BlurMask blur={6} style="solid" />
                </Circle>
                <Circle cx={p.x} cy={p.y} r={galaxy.self.radius} color={COLORS.self} />
              </>
            );
          })()}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
