import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurMask, Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface MatchArcProps {
  percent: number;
  size?: number;
  animate?: boolean;
  /** When true, use dark text + light track for placement on white backgrounds. */
  light?: boolean;
}

/**
 * Circular arc gauge for match score. Speedometer shape — gap at the bottom.
 * `light` flag flips the chrome for placement on cream/white card surfaces.
 * Number font size scales with `size` so the gauge looks right at any scale.
 */
export function MatchArc({ percent, size = 152, animate = true, light = false }: MatchArcProps) {
  const strokeWidth = Math.max(7, Math.round(size * 0.066));
  const pad = strokeWidth / 2 + 4;

  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(
      { x: pad, y: pad, width: size - pad * 2, height: size - pad * 2 },
      135,
      270,
    );
    return p;
  }, [size, pad]);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = animate
      ? withTiming(percent / 100, { duration: 900, easing: Easing.out(Easing.cubic) })
      : percent / 100;
  }, [percent, animate]);

  const trackColor = light ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  const numberColor = light ? '#000000' : '#FAFAF7';
  // % glyph: black on cream (4.5+ contrast); gold on navy is fine
  const pctColor = light ? '#000000' : colors.accent;
  const numberSize = Math.round(size * 0.34);
  const lineHeight = Math.round(numberSize * 1.15);
  const pctSize = Math.max(12, Math.round(size * 0.13));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Path
          path={trackPath}
          color={trackColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />
        <Path
          path={trackPath}
          color={colors.accent}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={progress}
        >
          <BlurMask blur={3} style="solid" />
        </Path>
      </Canvas>

      <View style={styles.center}>
        <Text style={[styles.number, { color: numberColor, fontSize: numberSize, lineHeight }]}>
          {percent}
        </Text>
        <Text style={[styles.pct, { color: pctColor, fontSize: pctSize, marginTop: Math.round(pctSize * 0.4) }]}>
          %
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  number: {
    fontFamily: 'JetBrainsMono-Medium',
    letterSpacing: -2,
  },
  pct: {
    fontFamily: 'Outfit-Bold',
    marginLeft: 2,
  },
});
