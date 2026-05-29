import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReferralStatus } from '@refr/shared';
import { Avatar } from '../common/Avatar';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { BoatVoyage } from './BoatVoyage';
import {
  formatEndorserName,
  StatusPill,
  statusMeta,
} from './referralCardShared';

/**
 * Endorser Voyage card.
 *
 * Compact and proportioned for a list of candidates the endorser is
 * actively shepherding. Two zones, no separate hero — a giant top-banner
 * felt out of scale and made the monogram fallback (e.g. "KR" filling
 * 95pt of vertical) look like a placeholder. The candidate's avatar
 * lives where it naturally belongs: inline next to the name.
 *
 * Layout: dark identity/action body above a flush full-width BoatVoyage.
 * Bespoke vs PaperVoyageCard: inline avatar, payout chip, and action row.
 */

type ActionKind = 'submit' | 'interviewing' | 'outcome' | 'view';

const PAYOUT_PER_HIRE = 22000;

export interface EndorserVoyageCardData {
  id: string;
  seekerName: string;
  seekerAvatar?: string;
  seekerHeadline: string;
  targetRole: string;
  companyName: string;
  status: ReferralStatus;
  /** Most recent stage timestamp — drives the day-context suffix. */
  stageTimestamp?: string | null;
  /** When defined, displayed as the payout chip. */
  payoutAmount?: number;
}

interface Props {
  data: EndorserVoyageCardData;
  onAction: (kind: ActionKind) => void;
  onChat: () => void;
  /** Disables the primary action while a transition is in flight. */
  pending?: boolean;
  active?: boolean;
}

function stageIndex(status: ReferralStatus): number {
  switch (status) {
    case 'requested':
    case 'accepted':
      return 0;
    case 'submitted':
      return 1;
    case 'interviewing':
      return 2;
    case 'hired':
      return 3;
    default:
      return -1;
  }
}

function actionForStage(
  status: ReferralStatus,
): { label: string; kind: ActionKind } | null {
  switch (status) {
    case 'requested':
    case 'accepted':
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
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export function EndorserVoyageCard({
  data,
  onAction,
  onChat,
  pending,
  active = true,
}: Props) {
  const meta = statusMeta(data.status, data.stageTimestamp);
  const action = actionForStage(data.status);
  const current = stageIndex(data.status);
  const isHired = data.status === 'hired';
  const display = formatEndorserName(data.seekerName) || data.seekerName;
  const payoutAmount = data.payoutAmount ?? PAYOUT_PER_HIRE;

  return (
    <View style={[styles.card, isHired && styles.cardHired]}>
      {/* Body */}
      <View style={styles.body}>
        <View style={styles.identityRow}>
          <Avatar
            displayName={display}
            uri={data.seekerAvatar}
            size="lg"
            verificationRing
          />
          <View style={styles.identityMeta}>
            <Text style={styles.name} numberOfLines={1}>
              {display}
            </Text>
            <Text style={styles.subline} numberOfLines={1}>
              {data.targetRole} · {data.companyName}
            </Text>
            <View style={styles.pillRow}>
              <StatusPill meta={meta} tone="dark" />
            </View>
          </View>
          <View
            style={[
              styles.payoutChip,
              isHired ? styles.payoutChipPaid : styles.payoutChipPending,
            ]}
          >
            <Text
              style={[
                styles.payoutLabel,
                isHired ? styles.payoutLabelPaid : styles.payoutLabelPending,
              ]}
            >
              {isHired ? 'PAID' : 'PAYOUT'}
            </Text>
            <Text
              style={[
                styles.payoutValue,
                isHired ? styles.payoutValuePaid : styles.payoutValuePending,
              ]}
            >
              {formatINR(payoutAmount)}
            </Text>
          </View>
        </View>

        {/* Action row sits above the voyage. */}
        <View style={styles.actions}>
          {action && (
            <Pressable
              onPress={() => onAction(action.kind)}
              disabled={pending}
              style={({ pressed }) => [
                styles.primaryBtn,
                isHired && styles.primaryBtnHired,
                pending && styles.primaryBtnPending,
                pressed && !pending && styles.primaryBtnPressed,
              ]}
            >
              {!pending && (
                <Ionicons
                  name={isHired ? 'star' : 'arrow-forward'}
                  size={13}
                  color="#0A1F44"
                />
              )}
              <Text style={styles.primaryBtnText} numberOfLines={1}>
                {pending ? 'Updating…' : action.label}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={onChat}
            style={({ pressed }) => [
              styles.chatBtn,
              pressed && styles.chatBtnPressed,
            ]}
            hitSlop={6}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Voyage zone — flush full-width at the bottom ────── */}
      <View style={styles.voyageZone}>
        <BoatVoyage current={current} tone="dark" active={active} />
      </View>
    </View>
  );
}

const CARD_HEIGHT = 240;
const VOYAGE_HEIGHT = 92;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.16)',
    borderRadius: layout.cardBorderRadiusLarge,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHired: {
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  /* Body — flex:1 takes whatever's between the top of the card and the
     fixed-height voyage zone. Padded so identity + actions get breathing
     room without the voyage encroaching. */
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: 'space-between',
    gap: 12,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  identityMeta: { flex: 1, gap: 3 },
  name: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 22,
    lineHeight: 26,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subline: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  pillRow: {
    marginTop: 3,
    alignItems: 'flex-start',
  },

  payoutChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    alignItems: 'center',
    gap: 1,
    borderWidth: 1,
  },
  payoutChipPending: {
    backgroundColor: 'rgba(212, 167, 68, 0.12)',
    borderColor: 'rgba(212, 167, 68, 0.34)',
  },
  payoutChipPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderColor: 'rgba(34, 197, 94, 0.55)',
  },
  payoutLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 8,
    letterSpacing: 1.3,
  },
  payoutLabelPending: { color: colors.gold },
  payoutLabelPaid: { color: colors.success },
  payoutValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  payoutValuePending: { color: colors.goldBright },
  payoutValuePaid: { color: '#BBF7D0' },

  /* Action row — tightened proportions:
     - Button height 36 instead of 42 — feels like a pill embedded in the
       card body rather than a fat blob taking a third of the body height.
     - Chat button matches at 36×36 so the pair reads as a single unit.
     - Slightly bigger horizontal padding + bigger icon-text gap so the
       label has room to breathe inside the slimmer pill. */
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    shadowColor: colors.accent,
    shadowOpacity: 0.30,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryBtnHired: {
    backgroundColor: colors.goldBright,
    shadowOpacity: 0.50,
  },
  primaryBtnPending: {
    opacity: 0.55,
    shadowOpacity: 0,
  },
  primaryBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  primaryBtnText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 13,
    color: '#0A1F44',
    letterSpacing: 0.15,
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLevel2,
  },
  chatBtnPressed: {
    backgroundColor: colors.surfaceActive,
    transform: [{ scale: 0.96 }],
  },

  /* Voyage zone — flush, full width, edge-to-edge. The dot matrix is the
     floor of the card; horizontal body padding doesn't apply here so the
     wave runs corner-to-corner. */
  voyageZone: {
    height: VOYAGE_HEIGHT,
  },
});
