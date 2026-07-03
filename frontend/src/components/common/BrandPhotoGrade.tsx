import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface BrandPhotoGradeProps {
  style?: StyleProp<ViewStyle>;
}

export function BrandPhotoGrade({ style }: BrandPhotoGradeProps): React.ReactElement {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={styles.warmWash} />
      <LinearGradient
        colors={[
          'rgba(244, 237, 221, 0.10)',
          'rgba(217, 164, 65, 0.08)',
          'rgba(12, 31, 25, 0.44)',
        ]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          'rgba(12, 31, 25, 0)',
          'rgba(12, 31, 25, 0.18)',
          'rgba(12, 31, 25, 0.62)',
        ]}
        locations={[0.32, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  warmWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundElevated,
    opacity: 0.18,
  },
});
