import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { PipelineStepper, type PipelineStage } from './PipelineStepper';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

/**
 * A single match in the endorser's Active list.
 * Encodes four pieces of data into one glanceable card:
 *   1. WHO  — avatar, name, role, "X at Company"
 *   2. WHERE — pipeline stage stepper (Matched → Submitted → Interviewing → Hired)
 *   3. WHEN — time in current stage
 *   4. WHAT NEXT — single primary action derived from current stage
 */

export interface MatchCardData {
  id: string;
  counterpartName: string;         // seeker name (from endorser view) or endorser name (from seeker view)
  counterpartAvatar?: string;
  counterpartSubtitle: string;     // e.g. "Senior Backend · 4y · PhonePe"
  targetRole: string;               // e.g. "Senior Backend Engineer"
  companyName: string;              // the endorsing company
  stage: PipelineStage;
  timeInStageLabel: string;         // e.g. "Matched 2h ago"
  payoutPending?: number;           // ₹ amount pending if hired (endorser only)
}

type ActionKind = 'submit' | 'interviewing' | 'outcome' | 'view';

interface Props {
  match: MatchCardData;
  /** Viewer role changes which action is primary. */
  viewerRole: 'endorser' | 'seeker';
  onAction: (kind: ActionKind) => void;
  onChat: () => void;
  pending?: boolean;
}

function actionForStage(stage: PipelineStage, role: 'endorser' | 'seeker'):
  | { label: string; kind: ActionKind }
  | null {
  if (role === 'seeker') {
    // Seekers track progress; their action is mostly "open chat" or view
    if (stage === 'hired') return { label: 'View offer', kind: 'view' };
    return null;
  }
  // Endorser actions
  switch (stage) {
    case 'matched':
    case 'accepted':
    case 'requested':
      return { label: 'Submit to HR', kind: 'submit' };
    case 'submitted':
      return { label: 'Mark interviewing', kind: 'interviewing' };
    case 'interviewing':
      return { label: 'Record outcome', kind: 'outcome' };
    case 'hired':
      return { label: 'View hire', kind: 'view' };
    default:
      return null;
  }
}

function formatINR(amount: number): string {
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export function MatchCard({ match, viewerRole, onAction, onChat, pending }: Props) {
  const action = useMemo(
    () => actionForStage(match.stage, viewerRole),
    [match.stage, viewerRole],
  );

  return (
    <View style={styles.card}>
      {/* Top row: avatar · meta · payout chip */}
      <View style={styles.topRow}>
        <Avatar displayName={match.counterpartName} uri={match.counterpartAvatar} size="md" />
        <View style={styles.topMeta}>
          <Text style={styles.name} numberOfLines={1}>{match.counterpartName}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{match.counterpartSubtitle}</Text>
          <Text style={styles.role} numberOfLines={1}>{match.targetRole} · {match.companyName}</Text>
        </View>
        {match.payoutPending !== undefined && match.stage !== 'hired' && (
          <View style={styles.payChip}>
            <Text style={styles.payChipLabel}>PAYOUT</Text>
            <Text style={styles.payChipValue}>{formatINR(match.payoutPending)}</Text>
          </View>
        )}
        {match.stage === 'hired' && match.payoutPending !== undefined && (
          <View style={[styles.payChip, styles.payChipPaid]}>
            <Text style={[styles.payChipLabel, { color: colors.success }]}>PAID</Text>
            <Text style={[styles.payChipValue, { color: colors.success }]}>{formatINR(match.payoutPending)}</Text>
          </View>
        )}
      </View>

      {/* Stage stepper */}
      <View style={styles.stepperWrap}>
        <PipelineStepper stage={match.stage} />
      </View>

      {/* Time in stage */}
      <Text style={styles.time}>{match.timeInStageLabel}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        {action && (
          <Button
            label={pending ? 'Updating…' : action.label}
            onPress={() => onAction(action.kind)}
            variant="primary"
            size="medium"
            disabled={pending}
            style={styles.primaryBtn}
          />
        )}
        <Pressable
          onPress={onChat}
          style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
        >
          <Text style={styles.chatBtnText}>Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLevel1,
    borderRadius: layout.cardBorderRadius,
    padding: layout.cardPadding,
    gap: spacing[4],
  },
  topRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  topMeta: { flex: 1, gap: 2 },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  role: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
    marginTop: 2,
  },
  payChip: {
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    alignItems: 'center',
    gap: 1,
  },
  payChipPaid: { backgroundColor: colors.successLight },
  payChipLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  payChipValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: colors.text,
  },
  stepperWrap: { paddingVertical: spacing[1] },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
    fontFamily: 'JetBrainsMono-Regular',
  },
  actions: { flexDirection: 'row', gap: spacing[3] },
  primaryBtn: { flex: 2 },
  chatBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtnPressed: { opacity: 0.7 },
  chatBtnText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
  },
});
