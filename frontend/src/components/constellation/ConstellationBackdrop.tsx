import React, { useMemo, useEffect } from 'react';
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
import { AuroraShader } from './AuroraShader';

const { width: W, height: H } = Dimensions.get('window');

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
}: Props) {
  const data = useMemo(() => galaxy ?? getDemoGalaxy(), [galaxy]);

  const pulse = useSharedValue(1);
  // Initial opacity matches the initial visible value so the very first paint
  // doesn't flash the backdrop in/out before the effect runs.
  const opacity = useSharedValue(visible ? 1 : 0);
  const { tiltX, tiltY } = useDeviceTilt();

  useEffect(() => {
    if (!alive) {
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
  }, [alive, pulse]);

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

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Aurora SkSL shader is ALWAYS on — never fades. The aurora is the
          constant atmospheric background of the app. */}
      <AuroraShader speed={0.85} />

      {/* The constellation network (orbs, paths, stars) is the only thing
          that fades. Hidden while there are cards to swipe so the user
          isn't distracted, fades back in when the queue is empty. */}
      <Animated.View style={[StyleSheet.absoluteFillObject, fadeStyle]} pointerEvents="none">
        <Canvas style={StyleSheet.absoluteFillObject}>
          {/* BACK LAYER — distant ambient orbs (slowest parallax) */}
          <Group transform={backTransform}>
            <Circle cx={W * 0.18} cy={H * 0.22} r={150} color="rgba(124, 58, 237, 0.20)">
              <BlurMask blur={75} style="normal" />
            </Circle>
            <Circle cx={W * 0.85} cy={H * 0.78} r={130} color="rgba(0, 255, 204, 0.10)">
              <BlurMask blur={75} style="normal" />
            </Circle>
          </Group>

          {/* MID LAYER — paths + connections (medium parallax) */}
          <Group transform={midTransform}>
            <PathLayer galaxy={data} />
            <NodeLayer
              nodes={data.connections}
              coreColor="rgba(96, 165, 250, 1)"
              glowColor="rgba(96, 165, 250, 0.45)"
              glowMultiplier={2.4}
              pulse={pulse}
            />
            <NodeLayer
              nodes={data.targets}
              coreColor="rgba(167, 139, 250, 1)"
              glowColor="rgba(167, 139, 250, 0.55)"
              glowMultiplier={2.8}
              pulse={pulse}
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

function PathLayer({ galaxy }: { galaxy: GalaxyData }) {
  return (
    <Group>
      {galaxy.paths.map((p) => {
        const from = galaxy.self;
        const to = galaxy.targets.find((t) => t.id === p.toId);
        if (!to) return null;
        return (
          <Line
            key={`${p.fromId}-${p.toId}`}
            p1={vec(from.x * W, from.y * H)}
            p2={vec(to.x * W, to.y * H)}
            color={p.activated ? 'rgba(0, 255, 204, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
            style="stroke"
            strokeWidth={p.activated ? 1.2 : 0.6}
          >
            {p.activated && <BlurMask blur={2} style="solid" />}
          </Line>
        );
      })}
    </Group>
  );
}

interface NodeLayerProps {
  nodes: GalaxyData['targets'];
  coreColor: string;
  glowColor: string;
  glowMultiplier: number;
  pulse: SharedValue<number>;
}

function NodeLayer({ nodes, coreColor, glowColor, glowMultiplier, pulse }: NodeLayerProps) {
  return (
    <Group>
      {nodes.map((n) => {
        const cx = n.x * W;
        const cy = n.y * H;
        const baseR = n.radius * (n.brightness > 0 ? n.brightness : 1);
        return (
          <Group key={n.id}>
            <Circle cx={cx} cy={cy} r={baseR * glowMultiplier} color={glowColor} opacity={pulse}>
              <BlurMask blur={12} style="solid" />
            </Circle>
            <Circle cx={cx} cy={cy} r={baseR} color={coreColor} />
          </Group>
        );
      })}
    </Group>
  );
}

function SelfNode({ galaxy, pulse }: { galaxy: GalaxyData; pulse: SharedValue<number> }) {
  const cx = galaxy.self.x * W;
  const cy = galaxy.self.y * H;
  const r = galaxy.self.radius;
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r * 3.6} color="rgba(0, 255, 204, 0.25)" opacity={pulse}>
        <BlurMask blur={22} style="solid" />
      </Circle>
      <Circle cx={cx} cy={cy} r={r * 2} color="rgba(0, 255, 204, 0.55)">
        <BlurMask blur={6} style="solid" />
      </Circle>
      <Circle cx={cx} cy={cy} r={r} color="#FAFAF7" />
    </Group>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
