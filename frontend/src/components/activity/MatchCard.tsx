import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../common/Avatar';
import { brandForName } from '../discover/companyBrand';
import { PipelineStepper, type PipelineStage } from './PipelineStepper';
import { Phrase } from '../../utils/haptics';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

/**
 * A single match in the endorser/seeker active list, rendered as a cream
 * credit-card with full nautical material treatment.
 *
 * Encodes four pieces of data into one glanceable card:
 *   1. WHO  — avatar, name, role, "X at Company"
 *   2. WHERE — pipeline stage stepper (Matched → Submitted → Interviewing → Hired)
 *   3. WHEN — time in current stage
 *   4. WHAT NEXT — single primary action derived from current stage
 */

const BLACK = '#000000';
const BLACK_70 = 'rgba(0, 0, 0, 0.70)';
const BLACK_55 = 'rgba(0, 0, 0, 0.55)';
const BLACK_35 = 'rgba(0, 0, 0, 0.35)';

export interface MatchCardData {
  id: string;
  counterpartName: string;
  counterpartAvatar?: string;
  counterpartSubtitle: string;
  targetRole: string;
  companyName: string;
  stage: PipelineStage;
  timeInStageLabel: string;
  payoutPending?: number;
}

type ActionKind = 'submit' | 'interviewing' | 'outcome' | 'view';

interface Props {
  match: MatchCardData;
  viewerRole: 'endorser' | 'seeker';
  onAction: (kind: ActionKind) => void;
  onChat: () => void;
  pending?: boolean;
}

function actionForStage(stage: PipelineStage, role: 'endorser' | 'seeker'):
  | { label: string; kind: ActionKind }
  | null {
  if (role === 'seeker') {
    if (stage === 'hired') return { label: 'View offer', kind: 'view' };
    return null;
  }
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
  const brand = useMemo(() => brandForName(match.companyName), [match.companyName]);

  const handleAction = () => {
    if (!action || pending) return;
    if (match.stage === 'hired') {
      Phrase.hire();
    } else {
      Phrase.tap();
    }
    onAction(action.kind);
  };

  const handleChat = () => {
    Phrase.tap();
    onChat();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        {/* Top row: avatar · meta · payout */}
        <View style={styles.topRow}>
          <Avatar displayName={match.counterpartName} uri={match.counterpartAvatar} size="md" />
          <View style={styles.topMeta}>
            <Text style={styles.name} numberOfLines={1}>{match.counterpartName}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{match.counterpartSubtitle}</Text>
            <View style={styles.targetLine}>
              <View style={[styles.companyDot, { backgroundColor: brand.tint }]} />
              <Text style={styles.role} numberOfLines={1}>
                {match.targetRole} · {match.companyName}
              </Text>
            </View>
          </View>
          {match.payoutPending !== undefined && match.stage !== 'hired' && (
            <View style={styles.payChip}>
              <Text style={styles.payChipLabel}>PAYOUT</Text>
              <Text style={styles.payChipValue}>{formatINR(match.payoutPending)}</Text>
            </View>
          )}
          {match.stage === 'hired' && match.payoutPending !== undefined && (
            <View style={[styles.payChip, styles.payChipPaid]}>
              <Text style={[styles.payChipLabel, styles.payChipPaidLabel]}>PAID</Text>
              <Text style={[styles.payChipValue, styles.payChipPaidValue]}>
                {formatINR(match.payoutPending)}
              </Text>
            </View>
          )}
        </View>

        {/* Stage stepper — light variant for cream card */}
        <View style={styles.stepperWrap}>
          <PipelineStepper stage={match.stage} light />
        </View>

        {/* Time in stage */}
        <Text style={styles.time}>{match.timeInStageLabel}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {action && (
            <Pressable
              onPress={handleAction}
              disabled={pending}
              style={[styles.primaryBtn, pending && { opacity: 0.5 }]}
            >
              <Text style={styles.primaryBtnText}>
                {pending ? 'Updating…' : action.label}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleChat}
            style={({ pressed }) => [styles.chatBtn, pressed && styles.chatBtnPressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={BLACK} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </Pressable>
        </View>
      </View>

      {/* Credit-card material overlays */}
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.04)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.materialSheen}
        pointerEvents="none"
      />
      <View style={styles.bevelTop} pointerEvents="none" />
      <View style={styles.bevelBottom} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  cardBody: {
    padding: 18,
    gap: 14,
  },

  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  topMeta: { flex: 1, gap: 3 },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: BLACK,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: BLACK_70,
  },
  targetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  companyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  role: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: BLACK,
    flex: 1,
  },

  payChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 167, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.5)',
    alignItems: 'center',
    gap: 1,
  },
  payChipLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 8,
    color: BLACK_55,
    letterSpacing: 1.3,
  },
  payChipValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
    color: BLACK,
  },
  payChipPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderColor: 'rgba(34, 197, 94, 0.55)',
  },
  payChipPaidLabel: { color: '#15803D' },
  payChipPaidValue: { color: '#14532D' },

  stepperWrap: { paddingVertical: 4 },

  time: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: BLACK_55,
    letterSpacing: 0.3,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#0A1F44',
    letterSpacing: 0.2,
  },
  chatBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BLACK_35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatBtnPressed: { opacity: 0.6 },
  chatBtnText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: BLACK,
  },

  /* Material overlays */
  materialSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: layout.cardBorderRadius,
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bevelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
