import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReferralStatus } from '@refr/shared';
import { colors } from '../../theme/colors';

/**
 * Vertical 4-segment progress rail for the Matches inbox.
 *
 * Compresses the same idea as Activity's BoatVoyage — "where is this
 * referral in the pipeline?" — into a 4-segment sliver that lives on the
 * left edge of each conversation row. The visual story:
 *
 *   stage  segment fill
 *   ─────  ──────────────────────────────────────────────
 *   past   solid stage colour @ 0.32 alpha
 *   now    solid stage colour @ 1.0 + outer halo
 *   next   1 px outline of stage colour @ 0.18 alpha
 *
 * Stage order matches the pipeline taxonomy:
 *   Matched (accepted/requested) → Submitted → Interviewing → Hired
 *
 * Hired in the active list is unusual (we route hired to the resting tier)
 * but rendering all 4 segments keeps the rail's silhouette consistent across
 * every row regardless of progress.
 *
 * Colours map to the existing `colors.pipeline*` tokens so the rail stays in
 * sync with the rest of the app's stage palette.
 */

type Stage = 'matched' | 'submitted' | 'interviewing' | 'hired';

const STAGES: Stage[] = ['matched', 'submitted', 'interviewing', 'hired'];

function stageOf(status: ReferralStatus): Stage | null {
  switch (status) {
    case 'requested':
    case 'accepted':
      return 'matched';
    case 'submitted':
      return 'submitted';
    case 'interviewing':
      return 'interviewing';
    case 'hired':
      return 'hired';
    default:
      // Terminal-but-not-hired (rejected/withdrawn/expired) — caller routes
      // these to the resting tier and shouldn't render the rail.
      return null;
  }
}

function colorFor(stage: Stage): string {
  switch (stage) {
    case 'matched':
      return colors.pipelineAccepted; // cool blue
    case 'submitted':
      return colors.pipelineSubmitted; // soft purple
    case 'interviewing':
      return colors.pipelineInterviewing; // warm cyan
    case 'hired':
      return colors.pipelineHired; // green
  }
}

interface Props {
  status: ReferralStatus;
}

export function StageRail({ status }: Props) {
  const current = stageOf(status);
  if (!current) return null;
  const currentIdx = STAGES.indexOf(current);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {STAGES.map((stage, i) => {
        const phase: 'past' | 'now' | 'next' =
          i < currentIdx ? 'past' : i === currentIdx ? 'now' : 'next';
        const tint = colorFor(stage);
        return (
          <View
            key={stage}
            style={[
              styles.segment,
              phase === 'past' && {
                backgroundColor: tint,
                opacity: 0.32,
              },
              phase === 'now' && {
                backgroundColor: tint,
                shadowColor: tint,
                shadowOpacity: 0.8,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              },
              phase === 'next' && {
                borderWidth: 1,
                borderColor: tint,
                opacity: 0.32,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const SEGMENT_HEIGHT = 13;
const SEGMENT_GAP = 4;
const SEGMENT_WIDTH = 3;

const styles = StyleSheet.create({
  wrap: {
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT * 4 + SEGMENT_GAP * 3,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  segment: {
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_WIDTH / 2,
  },
});
