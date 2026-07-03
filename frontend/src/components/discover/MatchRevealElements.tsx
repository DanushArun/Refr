import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProfileTile({
  name,
  uri,
  variant,
}: {
  name: string;
  uri?: string;
  variant: 'endorser' | 'seeker';
}): React.ReactElement {
  return (
    <View style={[styles.profileTile, variant === 'endorser' && styles.endorserTile]}>
      {uri ? (
        <Image source={{ uri }} style={styles.profileImage} />
      ) : (
        <View style={styles.initialsPlate}>
          <Text style={styles.initials}>{initialsFor(name)}</Text>
        </View>
      )}
      <View style={styles.profileScrim} />
      <Text numberOfLines={1} style={styles.profileName}>
        {firstName(name)}
      </Text>
    </View>
  );
}

export function RevealButton({
  icon,
  label,
  onPress,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone: 'primary' | 'secondary';
}): React.ReactElement {
  const primary = tone === 'primary';
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={19}
        color={primary ? colors.navyDeep : colors.text}
      />
      <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return name;
  return trimmed.split(/\s+/)[0] ?? name;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

const styles = StyleSheet.create({
  profileTile: {
    width: 122,
    height: 164,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: colors.surfaceLevel2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  endorserTile: {
    height: 142,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  initialsPlate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLevel2,
  },
  initials: {
    ...typography.h2,
    color: colors.brass,
  },
  profileScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    backgroundColor: 'rgba(7, 20, 15, 0.62)',
  },
  profileName: {
    position: 'absolute',
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[3],
    ...typography.rowTitle,
    color: colors.text,
    textAlign: 'center',
  },
  button: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  primaryButton: {
    backgroundColor: colors.brass,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    ...typography.buttonLabel,
    color: colors.text,
  },
  primaryButtonText: {
    color: colors.navyDeep,
  },
});
