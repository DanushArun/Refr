import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Group,
  Shadow,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

interface DialProps {
  progress: SharedValue<number>;
  size: number;
  strokeWidth: number;
}

export function SkeuomorphicDial({ progress, size, strokeWidth }: DialProps) {
  const bgPath = Skia.Path.Make();
  bgPath.addArc(
    { x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth },
    135,
    270
  );

  const animatedPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    // Clamp to minimum sweep to avoid Skia rendering issues on 0
    const sweep = Math.max(0.1, (progress.value / 100) * 270);
    p.addArc(
      { x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth },
      135,
      sweep
    );
    return p;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          {/* Background Track with Deep Inner Shadow */}
          <Path
            path={bgPath}
            color="#141416"
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
          >
            <Shadow dx={0} dy={4} blur={6} color="rgba(0, 0, 0, 0.9)" inner />
            <Shadow dx={0} dy={-1} blur={2} color="rgba(255, 255, 255, 0.15)" inner />
          </Path>

          {/* Active Liquid Fill */}
          <Path
            path={animatedPath}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, size)}
              end={vec(size, 0)}
              colors={['#008899', '#00E5FF']}
            />
            {/* Glowing Shadow for radioactive accent */}
            <Shadow dx={0} dy={0} blur={12} color="rgba(0, 229, 255, 0.6)" />
          </Path>
        </Group>
      </Canvas>
    </View>
  );
}
