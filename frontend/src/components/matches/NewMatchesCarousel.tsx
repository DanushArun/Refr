import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import type { SeekerPipelineItem } from '@refr/shared';
import { Avatar } from '../common/Avatar';
import { displayEndorserName } from '../activity/referralCardShared';

/**
 * Tier 1 — "New matches" horizontal carousel.
 *
 * Visual prompt to start a conversation with endorsers who just accepted.
 * Avatar circles with first-name labels — small enough that 5-6 fit before
 * the user has to scroll, big enough to feel social. Tap → opens the chat
 * pre-context.
 *
 * The gold pulse-ring is left as a follow-up; today the ring is the
 * Avatar's standard verification ring so the surface stays calm.
 */

interface Props {
  items: SeekerPipelineItem[];
  onPick: (item: SeekerPipelineItem) => void;
}

export function NewMatchesCarousel({ items, onPick }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>New matches</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        // Avatars are small, momentum scroll feels right. Decel normal.
      >
        {items.map((item) => {
          const name = displayEndorserName(item.referrerName);
          const first = name.split(/\s+/)[0] ?? name;
          return (
            <PressableScale
              key={item.referral.id}
              onPress={() => onPick(item)}
              style={styles.tile}
              hitSlop={6}
            >
              <Avatar displayName={name} size="lg" verificationRing />
              <Text style={styles.tileName} numberOfLines={1}>
                {first}
              </Text>
              <Text style={styles.tileCompany} numberOfLines={1}>
                {item.companyName}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const TILE_WIDTH = 76;

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    gap: 8,
  },
  title: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 20,
    color: '#FAFAF7',
    letterSpacing: 0,
  },
  count: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: 'rgba(250, 250, 247, 0.45)',
  },
  scroll: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 14,
  },
  tile: {
    width: TILE_WIDTH,
    alignItems: 'center',
    gap: 6,
  },
  // tilePressed removed — PressableScale handles the pressed state.
  tileName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#FAFAF7',
    letterSpacing: 0,
    textAlign: 'center',
    maxWidth: TILE_WIDTH,
  },
  tileCompany: {
    fontFamily: 'Outfit-Regular',
    fontSize: 10.5,
    color: 'rgba(250, 250, 247, 0.55)',
    letterSpacing: 0.3,
    textAlign: 'center',
    maxWidth: TILE_WIDTH,
  },
});
