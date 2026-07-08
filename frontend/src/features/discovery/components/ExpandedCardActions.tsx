import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../theme/colors';

export const EXPANDED_ACTION_SPACER_HEIGHT = 93;

interface ExpandedCardActionsProps {
  commitLabel: string;
  onPass: () => void;
  onCommit: () => void;
}

export function ExpandedCardActions({
  commitLabel,
  onPass,
  onCommit,
}: ExpandedCardActionsProps) {
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(245, 241, 232, 0)', 'rgba(245, 241, 232, 0.88)', colors.cardSurface]}
        locations={[0, 0.38, 1]}
        style={styles.fade}
      />
      <View style={styles.tray}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip"
          hitSlop={10}
          onPress={onPass}
          style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
        >
          <Ionicons name="close" size={14} color={colors.navyDeep} />
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={commitLabel}
          hitSlop={10}
          onPress={onCommit}
          style={({ pressed }) => [
            styles.commitButton,
            pressed && styles.commitButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[colors.sage, colors.sage]}
            style={styles.commitFill}
          >
            <View style={styles.commitIcon}>
              <Ionicons name="checkmark" size={12} color={colors.sage} />
            </View>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.86}
              numberOfLines={1}
              style={styles.commitText}
            >
              {commitLabel}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </>
  );
}

const BLACK_16 = 'rgba(0, 0, 0, 0.16)';

export const expandedActionStyles = StyleSheet.create({
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EXPANDED_ACTION_SPACER_HEIGHT,
    justifyContent: 'flex-end',
  },
  contentSpacer: {
    height: EXPANDED_ACTION_SPACER_HEIGHT,
  },
});

const styles = StyleSheet.create({
  fade: {
    ...StyleSheet.absoluteFillObject,
  },
  tray: {
    minHeight: 65,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 241, 232, 0.98)',
  },
  skipButton: {
    width: 62,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilion,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  skipButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  skipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: colors.navyDeep,
    letterSpacing: 0,
  },
  commitButton: {
    flex: 1,
    minWidth: 0,
    height: 39,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.sage,
    shadowColor: colors.sage,
    shadowOpacity: 0.26,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  commitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  commitFill: {
    flex: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  commitIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navyDeep,
    borderWidth: 1,
    borderColor: BLACK_16,
  },
  commitText: {
    flexShrink: 1,
    fontFamily: 'Outfit-Bold',
    fontSize: 13,
    color: colors.navyDeep,
    letterSpacing: 0,
  },
});
