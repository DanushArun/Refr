import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import type { SeekerPipelineItem } from '@refr/shared';
import { hapticSelection } from '../../utils/haptics';
import { latestStageTimestamp } from '../activity/referralCardShared';
import { RestingLedgerRow } from './RestingLedgerRow';
import { relativeLabel } from './matchTiering';

/**
 * Resting tier — a *ledger*, not a "second inbox."
 *
 * Visually distinct from the active list: tighter rows (52 px ledger
 * entries, no avatars), denser slab, dimmer rim. The whole section reads as
 * historical record so it doesn't compete for attention with the live
 * conversations above it.
 *
 * Default collapsed; the count + chevron is the only chrome shown until the
 * user opts in. Once expanded the rows reveal with a soft fade so the
 * transition doesn't jolt the eye.
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
      <PressableScale
        onPress={toggle}
        pressedScale={0.99}
        style={styles.headerRow}
      >
        <Text style={styles.title}>Ledger</Text>
        <Text style={styles.count}>{items.length}</Text>
        <Text style={styles.hint}>resting</Text>
        <View style={styles.spacer} />
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={16}
          color="rgba(250, 250, 247, 0.55)"
        />
      </PressableScale>

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
                <RestingLedgerRow
                  data={{
                    id: item.referral.id,
                    participantName: item.referrerName,
                    companyName: item.companyName,
                    role: item.referral.targetRole,
                    status: item.referral.status,
                    stageTimestamp: ts,
                  }}
                  onPress={() => onOpen(item)}
                  timeLabel={relativeLabel(ts)}
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
  // headerPressed removed — PressableScale handles the pressed state.
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
  /* Sub-label clarifies what "Ledger" means without taking a second line —
     keeps the section header tight at one row. */
  hint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: 'rgba(250, 250, 247, 0.32)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  spacer: { flex: 1 },
  /* Slab is denser + slightly more muted than the active rows so the tier
     reads as historical at a glance. Subtler rim, slightly inset on the
     left to differentiate the silhouette from active-pill rows. */
  list: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.10)',
  },
  divider: {
    height: 1,
    marginLeft: 36, // align past the glyph slot
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
