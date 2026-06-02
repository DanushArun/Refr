import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView, type BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { layout } from '../../theme/spacing';

interface FrostedGlassSurfaceProps {
  children: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const blurTint: BlurTint = Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark';

export function FrostedGlassSurface({
  children,
  borderRadius = layout.cardBorderRadius,
  style,
}: FrostedGlassSurfaceProps): React.ReactElement {
  return (
    <View style={[styles.surface, { borderRadius }, style]}>
      <BlurView
        blurReductionFactor={Platform.OS === 'android' ? 2 : undefined}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        intensity={Platform.OS === 'android' ? 96 : 82}
        pointerEvents="none"
        tint={blurTint}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.frostTint} />
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.14)',
          'rgba(255,255,255,0.04)',
          'rgba(0,0,0,0.26)',
        ]}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.topEdge} />
      <View pointerEvents="none" style={styles.innerShade} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    backgroundColor: 'rgba(3, 7, 18, 0.60)',
  },
  frostTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.032)',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  innerShade: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.30)',
  },
});
