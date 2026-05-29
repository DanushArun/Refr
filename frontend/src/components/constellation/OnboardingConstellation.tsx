import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Phrase } from '../../utils/haptics';
import { type GalaxyData } from '../../lib/constellation/buildGalaxy';
import { useDeviceTilt } from '../../hooks/useDeviceTilt';

const { width: W, height: H } = Dimensions.get('window');

interface OnboardingConstellationProps {
  galaxy: GalaxyData;
  onComplete?: () => void;
}

/**
 * Choreographed first-launch ritual.
 *
 * Stages (each separated by ~600ms):
 *   1. Black void → self star ignites at center (haptic: soft)
 *   2. Name fades in below
 *   3. Target stars appear one by one in a clockwise sweep (haptic: tick per star)
 *   4. Connection stars appear in mid-ring
 *   5. Paths draw outward from self to targets (haptic: heavier on first activated path)
 *   6. Closing label fades in
 *
 * Each stage advances a master `progress` shared value 0→1, which gates
 * opacity/scale on the relevant Skia primitives via useDerivedValue.
 */
export function OnboardingConstellation({ galaxy, onComplete }: OnboardingConstellationProps) {
  const { tiltX, tiltY } = useDeviceTilt();

  // One opacity driver per stage — animated in sequence
  const stageSelf = useSharedValue(0);
  const stageName = useSharedValue(0);
  const stageTargets = useSharedValue(0);
  const stageConnections = useSharedValue(0);
  const stagePaths = useSharedValue(0);
  const stageReady = useSharedValue(0);

  useEffect(() => {
    // Stage 1: self ignites — soft attack + soft echo
    stageSelf.value = withSequence(
      withTiming(1.2, { duration: 700, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 250, easing: Easing.out(Easing.quad) }),
    );
    setTimeout(() => Phrase.starIgnite(), 100);

    // Stage 2: name (delayed)
    stageName.value = withDelay(900, withTiming(1, { duration: 700 }));

    // Stage 3: targets sweep in — one tick per star
    stageTargets.value = withDelay(1700, withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }));
    galaxy.targets.forEach((_, i) => setTimeout(() => Phrase.starAppear(), 1700 + i * 180));

    // Stage 4: connections
    stageConnections.value = withDelay(3100, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));

    // Stage 5: paths draw outward — soft ascending chord
    stagePaths.value = withDelay(4100, withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }));
    setTimeout(() => Phrase.pathDraw(), 4100);

    // Stage 6: ready label — full ritual close cadence
    stageReady.value = withDelay(5400, withTiming(1, { duration: 700 }));
    setTimeout(() => Phrase.ritualComplete(), 5400);
    const completeId = setTimeout(() => onComplete?.(), 6400);

    return () => {
      clearTimeout(completeId);
    };
  }, [galaxy, stageSelf, stageName, stageTargets, stageConnections, stagePaths, stageReady, onComplete]);

  // Three parallax layers — Skia Group `transform` wants a single derived array
  const backTransform = useDerivedValue(() => [
    { translateX: tiltX.value * 8 },
    { translateY: tiltY.value * 8 },
  ]);
  const midTransform = useDerivedValue(() => [
    { translateX: tiltX.value * 16 },
    { translateY: tiltY.value * 16 },
  ]);
  const frontTransform = useDerivedValue(() => [
    { translateX: tiltX.value * 28 },
    { translateY: tiltY.value * 28 },
  ]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        {/* BACK — distant ambient haze */}
        <Group transform={backTransform}>
          <Circle cx={W * 0.18} cy={H * 0.22} r={150} color="rgba(124, 58, 237, 0.20)" opacity={stageSelf}>
            <BlurMask blur={75} style="normal" />
          </Circle>
          <Circle cx={W * 0.85} cy={H * 0.78} r={130} color="rgba(0, 255, 204, 0.10)" opacity={stageSelf}>
            <BlurMask blur={75} style="normal" />
          </Circle>
        </Group>

        {/* MID — paths + connections */}
        <Group transform={midTransform}>
          <PathLayer galaxy={galaxy} progress={stagePaths} />
          <NodeLayer
            nodes={galaxy.connections}
            progress={stageConnections}
            coreColor="rgba(96, 165, 250, 1)"
            glowColor="rgba(96, 165, 250, 0.45)"
            glowMul={2.4}
          />
          <NodeLayer
            nodes={galaxy.targets}
            progress={stageTargets}
            coreColor="rgba(167, 139, 250, 1)"
            glowColor="rgba(167, 139, 250, 0.55)"
            glowMul={2.8}
          />
        </Group>

        {/* FRONT — self */}
        <Group transform={frontTransform}>
          <SelfStar galaxy={galaxy} progress={stageSelf} />
        </Group>
      </Canvas>

      <NameOverlay galaxy={galaxy} progress={stageName} />
      <ReadyOverlay progress={stageReady} />
    </View>
  );
}

function PathLayer({ galaxy, progress }: { galaxy: GalaxyData; progress: SharedValue<number> }) {
  return (
    <Group opacity={progress}>
      {galaxy.paths.map((p) => {
        const to = galaxy.targets.find((t) => t.id === p.toId);
        if (!to) return null;
        return (
          <Line
            key={`${p.fromId}-${p.toId}`}
            p1={vec(galaxy.self.x * W, galaxy.self.y * H)}
            p2={vec(to.x * W, to.y * H)}
            color={p.activated ? 'rgba(0, 255, 204, 0.45)' : 'rgba(255, 255, 255, 0.10)'}
            style="stroke"
            strokeWidth={p.activated ? 1.4 : 0.7}
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
  progress: SharedValue<number>;
  coreColor: string;
  glowColor: string;
  glowMul: number;
}

function NodeLayer({ nodes, progress, coreColor, glowColor, glowMul }: NodeLayerProps) {
  return (
    <Group opacity={progress}>
      {nodes.map((n) => {
        const cx = n.x * W;
        const cy = n.y * H;
        const r = n.radius * (n.brightness > 0 ? n.brightness : 1);
        return (
          <Group key={n.id}>
            <Circle cx={cx} cy={cy} r={r * glowMul} color={glowColor}>
              <BlurMask blur={12} style="solid" />
            </Circle>
            <Circle cx={cx} cy={cy} r={r} color={coreColor} />
          </Group>
        );
      })}
    </Group>
  );
}

function SelfStar({ galaxy, progress }: { galaxy: GalaxyData; progress: SharedValue<number> }) {
  const cx = galaxy.self.x * W;
  const cy = galaxy.self.y * H;
  const r = galaxy.self.radius;

  // Scale grows with progress for the "ignite" effect
  const haloR = useDerivedValue(() => r * 3.6 * progress.value);
  const midR = useDerivedValue(() => r * 2 * progress.value);
  const coreR = useDerivedValue(() => r * progress.value);

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={haloR} color="rgba(0, 255, 204, 0.30)">
        <BlurMask blur={22} style="solid" />
      </Circle>
      <Circle cx={cx} cy={cy} r={midR} color="rgba(0, 255, 204, 0.55)">
        <BlurMask blur={6} style="solid" />
      </Circle>
      <Circle cx={cx} cy={cy} r={coreR} color="#FAFAF7" />
    </Group>
  );
}

function NameOverlay({ galaxy, progress }: { galaxy: GalaxyData; progress: SharedValue<number> }) {
  const opacityStyle = useDerivedValue(() => progress.value);
  return (
    <View style={styles.nameOverlay} pointerEvents="none">
      <AnimatedText opacity={opacityStyle}>{galaxy.self.label}</AnimatedText>
    </View>
  );
}

function ReadyOverlay({ progress }: { progress: SharedValue<number> }) {
  const opacityStyle = useDerivedValue(() => progress.value);
  return (
    <View style={styles.readyOverlay} pointerEvents="none">
      <AnimatedSubtitle opacity={opacityStyle} text="Your galaxy is ready" />
    </View>
  );
}

// Tiny wrapper that drives Text opacity via Reanimated
function AnimatedText({ children, opacity }: { children: React.ReactNode; opacity: SharedValue<number> }) {
  const Animated = require('react-native-reanimated').default;
  const style = useMemo(() => ({ opacity }), [opacity]);
  return <Animated.Text style={[styles.nameText, style]}>{children}</Animated.Text>;
}

function AnimatedSubtitle({ text, opacity }: { text: string; opacity: SharedValue<number> }) {
  const Animated = require('react-native-reanimated').default;
  const style = useMemo(() => ({ opacity }), [opacity]);
  return <Animated.Text style={[styles.readyText, style]}>{text}</Animated.Text>;
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  nameOverlay: {
    position: 'absolute',
    top: H * 0.55,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nameText: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 36,
    color: '#FAFAF7',
    letterSpacing: 0.5,
  },
  readyOverlay: {
    position: 'absolute',
    bottom: H * 0.16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  readyText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: 'rgba(250, 250, 247, 0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
