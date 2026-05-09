import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import type { SeekerPipelineItem } from '@refr/shared';
import { hapticSelection } from '../../utils/haptics';
import { latestStageTimestamp } from '../activity/referralCardShared';
import { MatchInboxRow } from './MatchInboxRow';
import { relativeLabel } from './matchTiering';

/**
 * Tier 3 — "Resting" collapsible section.
 *
 * Long-tail / archived matches: terminal outcomes (hired, rejected,
 * withdrawn, expired) and conversations that have gone 30+ days without
 * activity. We never delete user history, but it doesn't earn space on the
 * active surface — so it lives behind a single tap.
 *
 * Default collapsed; expanding reveals dimmed rows so they read as
 * historical at a glance. Same row component as the active list, just with
 * `dimmed` set, so any future row improvement applies everywhere.
 */

interface Props {
  items: SeekerPipelineItem[];
  onOpen: (item: SeekerPipelineItem) => void;
}

export function RestingSection({ items, onOpen }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const toggle = () => {
    hapticSelection();
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.headerRow,
          pressed && styles.headerPressed,
        ]}
      >
        <Text style={styles.title}>Resting</Text>
        <Text style={styles.count}>{items.length}</Text>
        <View style={styles.spacer} />
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={16}
          color="rgba(250, 250, 247, 0.55)"
        />
      </Pressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(220).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(160)}
          style={styles.list}
        >
          {items.map((item, i) => {
            const ts = latestStageTimestamp(item.referral);
            return (
              <View key={item.referral.id}>
                {i > 0 && <View style={styles.divider} />}
                <MatchInboxRow
                  data={{
                    id: item.referral.id,
                    endorserName: item.referrerName,
                    companyName: item.companyName,
                    role: item.referral.targetRole,
                    status: item.referral.status,
                    stageTimestamp: ts,
                  }}
                  onPress={() => onOpen(item)}
                  timeLabel={relativeLabel(ts)}
                  dimmed
                />
              </View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  headerPressed: {
    opacity: 0.7,
  },
  title: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 18,
    color: '#FAFAF7',
    letterSpacing: -0.2,
  },
  count: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: 'rgba(250, 250, 247, 0.45)',
  },
  spacer: { flex: 1 },
  /* Same dark-glass treatment as the active list, slightly more muted so
     the resting tier reads as historical at a glance. */
  list: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.10)',
  },
  divider: {
    height: 1,
    marginLeft: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
