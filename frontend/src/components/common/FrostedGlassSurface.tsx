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
    <View style={[frostedGlassSurfaceStyles.surface, { borderRadius }, style]}>
      <BlurView
        blurReductionFactor={Platform.OS === 'android' ? 2 : undefined}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        intensity={Platform.OS === 'android' ? 96 : 82}
        pointerEvents="none"
        tint={blurTint}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={frostedGlassSurfaceStyles.frostTint} />
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.10)',
          'rgba(255,255,255,0.035)',
          'rgba(0,0,0,0.18)',
        ]}
        locations={[0, 0.46, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

export const frostedGlassSurfaceStyles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.60)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  frostTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.032)',
  },
});
