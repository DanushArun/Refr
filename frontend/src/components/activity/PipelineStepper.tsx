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
  /** When true, uses dark inactive elements + dark labels for placement on cream cards. */
  light?: boolean;
}

const STEPS: { key: PipelineStage; label: string }[] = [
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interview' },
  { key: 'hired', label: 'Hired' },
];

/**
 * Single-hue gold pipeline. The DOT color stays close so it reads as one
 * material; what intensifies per stage is the GLOW. Earlier stages have a
 * small soft halo, later stages emit progressively brighter, larger halos.
 * Hired blazes. Terminal-bad states keep semantic colors (red/grey).
 */
const GOLD_CORE = '#D4A744';
const GOLD_BRIGHT = '#FFD56A';

const STAGE_COLORS: Record<string, string> = {
  matched:      GOLD_CORE,
  accepted:     GOLD_CORE,
  requested:    GOLD_CORE,
  submitted:    GOLD_CORE,
  interviewing: GOLD_BRIGHT,
  hired:        GOLD_BRIGHT,
  rejected:     colors.error,
  withdrawn:    colors.textTertiary,
  expired:      colors.textTertiary,
};

/**
 * Per-stage brightness factor 0..1. Drives glow size, glow opacity, and
 * elevation/shadow strength so each subsequent step *feels* brighter, not
 * just looks like a different shade.
 */
const STAGE_BRIGHTNESS: Record<string, number> = {
  matched:      0.32,
  accepted:     0.32,
  requested:    0.32,
  submitted:    0.58,
  interviewing: 0.80,
  hired:        1.00,
  rejected:     0,
  withdrawn:    0,
  expired:      0,
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

export function PipelineStepper({ stage, compact = false, light = false }: Props) {
  // Inactive chrome flips to dark variants when placed on a cream card surface
  const inactiveBorder = light ? 'rgba(0,0,0,0.18)' : colors.border;
  const inactiveLabel = light ? 'rgba(0,0,0,0.40)' : colors.textTertiary;
  const checkColor = light ? '#FAFAF7' : '#0a0a0f';

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

  const baseDot = compact ? 14 : 18;

  return (
    <View style={styles.wrap}>
      <View style={styles.trackRow}>
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const lit = done || active;
          const stepColor = STAGE_COLORS[step.key] ?? colors.accent;
          const brightness = STAGE_BRIGHTNESS[step.key] ?? 0;

          // Halo grows + intensifies with the stage's brightness factor.
          // A dim early stage shows a small, faint glow; late stages glow hard.
          const haloSize = baseDot + 6 + brightness * 26;
          const haloOpacity = brightness * 0.55;

          // Native shadow gives the dot itself an emitting quality on iOS
          const shadowProps = lit
            ? {
                shadowColor: stepColor,
                shadowOpacity: 0.35 + brightness * 0.55,
                shadowRadius: 4 + brightness * 12,
                shadowOffset: { width: 0, height: 0 },
                elevation: 4 + brightness * 8,
              }
            : null;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.dotSlot}>
                {lit && (
                  <View
                    style={[
                      styles.halo,
                      {
                        width: haloSize,
                        height: haloSize,
                        borderRadius: haloSize / 2,
                        backgroundColor: stepColor,
                        opacity: haloOpacity,
                      },
                    ]}
                    pointerEvents="none"
                  />
                )}
                <View
                  style={[
                    styles.dot,
                    compact && styles.dotCompact,
                    {
                      backgroundColor: lit ? stepColor : 'transparent',
                      borderColor: lit ? stepColor : inactiveBorder,
                    },
                    shadowProps,
                  ]}
                >
                  {done && <Text style={[styles.check, { color: checkColor }]}>✓</Text>}
                </View>
              </View>
              {i < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      // Connector ramps to the brighter endpoint when done so
                      // the rail climbs in luminance left-to-right.
                      backgroundColor:
                        i < current
                          ? STAGE_COLORS[STEPS[i + 1].key] ?? stepColor
                          : inactiveBorder,
                    },
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
            const stepColor = STAGE_COLORS[step.key] ?? colors.accent;
            const c = done || active ? stepColor : inactiveLabel;
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
  dotSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
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
  check: { fontSize: 10, fontFamily: 'Outfit-Bold' },
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
