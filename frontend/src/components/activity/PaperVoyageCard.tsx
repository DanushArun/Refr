import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReferralStatus } from '@refr/shared';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { officeImageFor } from './companyOffices';

const BLACK = '#0F1115';
const BLACK_70 = 'rgba(15, 17, 21, 0.70)';
const BLACK_55 = 'rgba(15, 17, 21, 0.55)';
const BLACK_38 = 'rgba(15, 17, 21, 0.38)';
const BLACK_18 = 'rgba(15, 17, 21, 0.18)';
const GOLD = '#C8A24B';

const STAGES: { key: 'matched' | 'submitted' | 'interviewing' | 'hired'; label: string }[] = [
  { key: 'matched', label: 'MATCHED' },
  { key: 'submitted', label: 'SUBMITTED' },
  { key: 'interviewing', label: 'INTERVIEW' },
  { key: 'hired', label: 'HIRED' },
];

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

function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

interface StatusMeta {
  label: string;
  variant: 'gold' | 'plain' | 'bad';
}

function statusMeta(status: ReferralStatus, ts?: string | null): StatusMeta {
  switch (status) {
    case 'hired':
      return { label: 'HIRED', variant: 'gold' };
    case 'interviewing':
      return { label: 'INTERVIEWING', variant: 'plain' };
    case 'submitted': {
      const d = daysSince(ts);
      return { label: d != null ? `SUBMITTED · ${d}D` : 'SUBMITTED', variant: 'plain' };
    }
    case 'accepted':
    case 'requested':
      return { label: 'MATCHED', variant: 'plain' };
    case 'rejected':
      return { label: 'PASSED', variant: 'bad' };
    case 'withdrawn':
      return { label: 'WITHDRAWN', variant: 'bad' };
    case 'expired':
      return { label: 'EXPIRED', variant: 'bad' };
    default:
      return { label: String(status).toUpperCase(), variant: 'plain' };
  }
}

export interface PaperVoyageCardData {
  companyName: string;
  role: string;
  endorserName: string;
  status: ReferralStatus;
  /** Most recent stage timestamp — drives "X days" suffix on submitted etc. */
  stageTimestamp?: string | null;
  /** Optional override; otherwise picks deterministically from a curated set. */
  imageUri?: string | null;
}

interface Props {
  data: PaperVoyageCardData;
}

export function PaperVoyageCard({ data }: Props) {
  const image = useMemo(
    () => data.imageUri ?? officeImageFor(data.companyName),
    [data.imageUri, data.companyName],
  );
  const meta = statusMeta(data.status, data.stageTimestamp);
  const current = stageIndex(data.status);
  const isHired = data.status === 'hired';
  const endorserDisplay = data.endorserName
    ? formatEndorserName(data.endorserName)
    : '';

  return (
    <View style={[styles.card, isHired && styles.cardHired]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        {isHired && (
          <>
            <LinearGradient
              colors={['rgba(212,167,68,0)', 'rgba(212,167,68,0.20)', 'rgba(212,167,68,0.55)']}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageHiredSheen}
              pointerEvents="none"
            />
            <View style={styles.hiredRibbon} pointerEvents="none">
              <Text style={styles.hiredRibbonText}>★ ENDORSEMENT CONVERTED</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.company} numberOfLines={1}>{data.companyName}</Text>
            <Text style={styles.role} numberOfLines={1}>{data.role}</Text>
          </View>
          <StatusPill meta={meta} />
        </View>

        {!!endorserDisplay && (
          <Text style={styles.endorser} numberOfLines={1}>
            <Text style={styles.endorserLabel}>Endorser: </Text>
            {endorserDisplay}
          </Text>
        )}

        <View style={styles.stepperWrap}>
          <Stepper current={current} />
        </View>
      </View>
    </View>
  );
}

function formatEndorserName(full: string): string {
  const trimmed = full.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function StatusPill({ meta }: { meta: StatusMeta }) {
  if (meta.variant === 'gold') {
    return (
      <View style={[styles.pill, styles.pillGold]}>
        <Text style={styles.pillStar}>★</Text>
        <Text style={[styles.pillText, styles.pillTextGold]}>{meta.label}</Text>
      </View>
    );
  }
  if (meta.variant === 'bad') {
    return (
      <View style={[styles.pill, styles.pillBad]}>
        <Text style={[styles.pillText, styles.pillTextBad]}>{meta.label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.pillPlain}>
      <Text style={[styles.pillText, styles.pillTextPlain]}>{meta.label}</Text>
    </View>
  );
}

function DottedLine() {
  return (
    <View style={styles.dottedRow}>
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={styles.dottedPip} />
      ))}
    </View>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <View>
      <View style={styles.trackRow}>
        {STAGES.map((s, i) => {
          const done = current >= 0 && i < current;
          const active = i === current;
          const lit = done || active;
          const isLast = i === STAGES.length - 1;
          const segDone = current >= 0 && i < current;
          return (
            <React.Fragment key={s.key}>
              <View style={styles.dotSlot}>
                <View
                  style={[
                    styles.dot,
                    lit ? styles.dotLit : styles.dotEmpty,
                    active && styles.dotActive,
                  ]}
                />
              </View>
              {!isLast && (
                <View style={styles.segment}>
                  {segDone ? (
                    <View style={styles.segmentLineDone} />
                  ) : (
                    <DottedLine />
                  )}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {STAGES.map((s, i) => {
          const done = current >= 0 && i < current;
          const active = i === current;
          const align: 'left' | 'right' | 'center' =
            i === 0 ? 'left' : i === STAGES.length - 1 ? 'right' : 'center';
          return (
            <Text
              key={s.key}
              style={[
                styles.stageLabel,
                { textAlign: align },
                active && styles.stageLabelActive,
                !active && !done && styles.stageLabelPending,
              ]}
            >
              {s.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const CARD_HEIGHT = 280;
const IMAGE_FLEX = 0.4;
const BODY_FLEX = 0.6;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.cardSurface,
    borderRadius: layout.cardBorderRadiusLarge,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  cardHired: {
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  imageWrap: {
    width: '100%',
    flex: IMAGE_FLEX,
    backgroundColor: colors.cardSurface,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardSurface,
  },
  imageHiredSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  hiredRibbon: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(10, 31, 68, 0.78)',
  },
  hiredRibbonText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: colors.goldBright,
  },
  body: {
    flex: BODY_FLEX,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 2 },
  company: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 26,
    color: BLACK,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  role: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: BLACK_70,
  },
  endorser: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: BLACK,
    letterSpacing: 0,
  },
  endorserLabel: {
    fontFamily: 'Outfit-Regular',
    color: BLACK_55,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pillGold: {
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pillStar: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    color: '#FAFAF7',
    marginTop: -1,
  },
  pillBad: { backgroundColor: 'rgba(178, 30, 50, 0.10)' },
  pillPlain: {
    paddingHorizontal: 0,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    letterSpacing: 1.4,
  },
  pillTextGold: { color: '#FAFAF7' },
  pillTextPlain: { color: BLACK_55 },
  pillTextBad: { color: '#B21E32' },

  stepperWrap: { paddingTop: 6, gap: 8 },

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dotSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  dotLit: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: BLACK_38,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: GOLD,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  segment: {
    flex: 1,
    height: 8,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentLineDone: { height: 1.5, borderRadius: 1, backgroundColor: GOLD },
  dottedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dottedPip: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: BLACK_38,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  stageLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 9.5,
    letterSpacing: 1.1,
    color: BLACK_55,
    flex: 1,
    textAlign: 'center',
  },
  stageLabelActive: {
    fontFamily: 'Outfit-Bold',
    color: BLACK,
  },
  stageLabelPending: {
    color: BLACK_38,
  },
});
