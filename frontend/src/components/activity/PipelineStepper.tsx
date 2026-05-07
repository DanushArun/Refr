import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * 4-stage pipeline stepper shown on every MatchCard.
 * Reads at a glance: which stage the match is in, how far it has progressed,
 * and (implicitly) what's next.
 *
 * Stages: matched → submitted → interviewing → hired
 * Terminal bad states (rejected, withdrawn, expired) render as a single muted pill instead.
 */

export type PipelineStage =
  | 'matched'
  | 'submitted'
  | 'interviewing'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'expired'
  // accepted is legacy from the pre-swipe model; treat as matched
  | 'accepted'
  // requested is legacy; treat as matched pending chat
  | 'requested';

interface Props {
  stage: PipelineStage;
  compact?: boolean;
}

const STEPS: { key: PipelineStage; label: string }[] = [
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interview' },
  { key: 'hired', label: 'Hired' },
];

const STAGE_COLORS: Record<string, string> = {
  matched: '#3b82f6',
  accepted: '#3b82f6',
  requested: '#f59e0b',
  submitted: '#8b5cf6',
  interviewing: '#06b6d4',
  hired: colors.success,
  rejected: colors.error,
  withdrawn: colors.textTertiary,
  expired: colors.textTertiary,
};

function normalize(stage: PipelineStage): PipelineStage {
  if (stage === 'accepted') return 'matched';
  if (stage === 'requested') return 'matched';
  return stage;
}

function currentIndex(stage: PipelineStage): number {
  const n = normalize(stage);
  const idx = STEPS.findIndex((s) => s.key === n);
  return idx;
}

function isTerminalBad(stage: PipelineStage): boolean {
  return stage === 'rejected' || stage === 'withdrawn' || stage === 'expired';
}

export function PipelineStepper({ stage, compact = false }: Props) {
  if (isTerminalBad(stage)) {
    const c = STAGE_COLORS[stage];
    return (
      <View style={[styles.terminal, { backgroundColor: c + '18', borderColor: c + '55' }]}>
        <Text style={[styles.terminalText, { color: c }]}>
          {stage === 'rejected' ? 'Rejected by company' : stage === 'withdrawn' ? 'Withdrawn by seeker' : 'Expired'}
        </Text>
      </View>
    );
  }

  const current = Math.max(0, currentIndex(stage));
  const color = STAGE_COLORS[normalize(stage)] ?? colors.accent;

  return (
    <View style={styles.wrap}>
      <View style={styles.trackRow}>
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const dotColor = done || active ? color : 'transparent';
          const borderColor = done || active ? color : colors.border;
          return (
            <React.Fragment key={step.key}>
              <View
                style={[
                  styles.dot,
                  compact && styles.dotCompact,
                  { backgroundColor: dotColor, borderColor },
                  active && { boxShadow: `0 0 0 4px ${color}22` as unknown as string },
                ]}
              >
                {done && <Text style={styles.check}>✓</Text>}
              </View>
              {i < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: i < current ? color : colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {!compact && (
        <View style={styles.labelRow}>
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            const c = done || active ? color : colors.textTertiary;
            return (
              <Text
                key={step.key}
                style={[styles.label, { color: c, fontFamily: active ? 'Outfit-SemiBold' : 'Outfit-Medium' }]}
              >
                {step.label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[2] },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompact: { width: 14, height: 14, borderRadius: 7 },
  check: { color: '#0a0a0f', fontSize: 10, fontFamily: 'Outfit-Bold' },
  line: { flex: 1, height: 1.5 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  terminal: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: 8,
    borderWidth: 1,
  },
  terminalText: {
    ...typography.caption,
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
