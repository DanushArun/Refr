import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import type { ReferralStatus } from '@refr/shared';
import { colors } from '../../theme/colors';
import { formatEndorserName } from '../activity/referralCardShared';

/**
 * Resting tier row — a "ledger entry," not an "inbox row."
 *
 * Deliberately a different artefact from the active pill so the user
 * recognises at a glance that they're looking at history, not live
 * conversations. Compact (52 px), avatar-less, monogram-led.
 *
 *   ┌───────────────────────────────────────────────────────────┐
 *   │ ★  Aarav Verma            Razorpay · Sr Backend     Mar 4 │
 *   └───────────────────────────────────────────────────────────┘
 *     ↑                                                      ↑
 *   outcome glyph                                       date stamp
 *
 * The outcome glyph encodes the terminal state directly:
 *   ★ HIRED         — gold, the only celebratory entry
 *   ◇ EXPIRED/STALE — warm gold dim, neutral closure
 *   ✕ PASSED        — soft red, declined outcome
 *
 * Why no avatar: stops resting from competing with the active list
 * visually. The eye should treat this section as a quiet log, not a second
 * inbox.
 */

export interface RestingLedgerRowData {
  id: string;
  /** The other party's name. Generic so the row works on both sides. */
  participantName: string;
  companyName: string;
  role: string;
  status: ReferralStatus;
  /** Date the referral reached its current resting state — drives the right-
   *  aligned timestamp. */
  stageTimestamp?: string | null;
}

interface Props {
  data: RestingLedgerRowData;
  onPress: () => void;
  /** Pre-formatted relative date label ("Mar 4", "3w", "Yesterday") — kept
   *  as a prop so the screen owns relative-time formatting and the row
   *  stays presentation-only. */
  timeLabel?: string;
}

interface Outcome {
  glyph: string;
  color: string;
  label: string;
}

function outcomeFor(status: ReferralStatus): Outcome {
  switch (status) {
    case 'hired':
      return { glyph: '★', color: colors.gold, label: 'HIRED' };
    case 'rejected':
      return { glyph: '✕', color: '#FF6B7A', label: 'PASSED' };
    case 'withdrawn':
      return { glyph: '↶', color: 'rgba(250, 250, 247, 0.45)', label: 'WITHDRAWN' };
    case 'expired':
      return { glyph: '◇', color: 'rgba(212, 167, 68, 0.55)', label: 'EXPIRED' };
    default:
      // Stale-but-not-terminal — treat as resting-by-inactivity.
      return { glyph: '◌', color: 'rgba(250, 250, 247, 0.35)', label: 'RESTING' };
  }
}

/**
 * Memoized — same reasoning as MatchInboxRow. The Resting tier can hold
 * dozens of rows; rendering them all on every tier change is wasteful.
 */
function RestingLedgerRowImpl({ data, onPress, timeLabel }: Props) {
  const display = formatEndorserName(data.participantName) || data.participantName;
  const outcome = outcomeFor(data.status);
  const isHired = data.status === 'hired';

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.99}
      style={styles.row}
    >
      {/* Outcome glyph slot — fixed width so names align across all rows */}
      <View style={styles.glyphSlot}>
        <Text style={[styles.glyph, { color: outcome.color }]}>
          {outcome.glyph}
        </Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {display}
          </Text>
          {/* Tiny outcome chip — only rendered for HIRED; the gold needs
              celebrating, the others stay implicit via glyph colour. */}
          {isHired && (
            <Text style={[styles.outcomeChip, { color: colors.gold }]}>
              {outcome.label}
            </Text>
          )}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {data.companyName} · {data.role}
        </Text>
      </View>

      {!!timeLabel && <Text style={styles.time}>{timeLabel}</Text>}
    </PressableScale>
  );
}

export const RestingLedgerRow = React.memo(RestingLedgerRowImpl, (prev, next) =>
  prev.data.id === next.data.id &&
  prev.data.status === next.data.status &&
  prev.data.participantName === next.data.participantName &&
  prev.data.companyName === next.data.companyName &&
  prev.data.role === next.data.role &&
  prev.timeLabel === next.timeLabel &&
  prev.onPress === next.onPress
);

const ROW_HEIGHT = 52;

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  // rowPressed removed — PressableScale handles the pressed state.
  glyphSlot: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 18,
    lineHeight: 22,
  },
  middle: {
    flex: 1,
    gap: 1,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: 'rgba(250, 250, 247, 0.78)',
    letterSpacing: -0.05,
  },
  outcomeChip: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    letterSpacing: 1.4,
  },
  sub: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11.5,
    color: 'rgba(250, 250, 247, 0.45)',
    letterSpacing: 0.1,
  },
  time: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: 'rgba(250, 250, 247, 0.35)',
    letterSpacing: 0.5,
  },
});
