import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';

export const EXPANDED_ACTION_SPACER_HEIGHT = 124;

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
          hitSlop={6}
          onPress={onPass}
          style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
        >
          <Ionicons name="close" size={18} color={BLACK_55} />
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={commitLabel}
          onPress={onCommit}
          style={({ pressed }) => [
            styles.commitButton,
            pressed && styles.commitButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#102247', colors.navyDeep]}
            style={styles.commitFill}
          >
            <View style={styles.commitIcon}>
              <Ionicons name="checkmark" size={15} color={colors.navyDeep} />
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

const BLACK_55 = 'rgba(0, 0, 0, 0.55)';
const BLACK_16 = 'rgba(0, 0, 0, 0.16)';
const BLACK_08 = 'rgba(0, 0, 0, 0.08)';
const BLACK_05 = 'rgba(0, 0, 0, 0.05)';

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
    minHeight: 86,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 241, 232, 0.98)',
  },
  skipButton: {
    width: 82,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BLACK_08,
    backgroundColor: BLACK_05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  skipButtonPressed: {
    backgroundColor: BLACK_08,
    transform: [{ scale: 0.98 }],
  },
  skipText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: BLACK_55,
    letterSpacing: 0,
  },
  commitButton: {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.32)',
    shadowColor: colors.navyDeep,
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  commitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  commitFill: {
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  commitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldBright,
    borderWidth: 1,
    borderColor: BLACK_16,
  },
  commitText: {
    flexShrink: 1,
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: colors.cream,
    letterSpacing: 0,
  },
});
