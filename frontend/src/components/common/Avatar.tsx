import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  displayName: string;
  size?: AvatarSize;
  /** Show a violet verification ring around the avatar */
  verificationRing?: boolean;
  /** Show a green online indicator dot */
  online?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

const fontSizeMap: Record<AvatarSize, number> = {
  xs: 11,
  sm: 13,
  md: 17,
  lg: 22,
  xl: 28,
};

/** Extract initials — up to 2 characters from display name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Generate a deterministic background color from name string */
function getAvatarColor(name: string): string {
  const palette = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/**
 * Avatar — user avatar with graceful fallback to initials monogram.
 *
 * verificationRing — adds a 2px violet ring for verified referrers.
 * online           — adds a green dot indicator in the bottom-right corner.
 */
export function Avatar({
  uri,
  displayName,
  size = 'md',
  verificationRing = false,
  online = false,
}: AvatarProps) {
  const dim = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const bgColor = getAvatarColor(displayName);
  const ringPad = verificationRing ? 2 : 0;
  const dotSize = Math.max(8, Math.round(dim * 0.22));

  return (
    <View style={{ width: dim + ringPad * 2, height: dim + ringPad * 2 }}>
      {verificationRing && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: (dim + ringPad * 2) / 2,
              borderWidth: 2,
              borderColor: colors.accent,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.circle,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: bgColor,
            margin: ringPad,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: dim, height: dim, borderRadius: dim / 2 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials(displayName)}
          </Text>
        )}
      </View>

      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: ringPad,
              right: ringPad,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: 'Outfit-SemiBold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
