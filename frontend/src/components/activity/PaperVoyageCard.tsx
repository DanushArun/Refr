import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReferralStatus } from '@refr/shared';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { brandForName } from '../discover/companyBrand';
import { BoatVoyage } from './BoatVoyage';

const BLACK = '#0F1115';
const BLACK_70 = 'rgba(15, 17, 21, 0.70)';
const BLACK_55 = 'rgba(15, 17, 21, 0.55)';
const GOLD = '#C8A24B';

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
}

interface Props {
  data: PaperVoyageCardData;
}

export function PaperVoyageCard({ data }: Props) {
  const meta = statusMeta(data.status, data.stageTimestamp);
  const current = stageIndex(data.status);
  const isHired = data.status === 'hired';
  const endorserDisplay = data.endorserName
    ? formatEndorserName(data.endorserName)
    : '';
  // Brand-driven hero — replaces the previous stock office photo, which
  // recycled across companies and read as random/duplicate. Each company
  // gets its own real brand color + monogram from the discover registry.
  const brand = brandForName(data.companyName);

  return (
    <View style={[styles.card, isHired && styles.cardHired]}>
      <View style={styles.brandWrap}>
        <LinearGradient
          colors={[brand.tint, brand.tintEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.brandRow}>
          <View
            style={[
              styles.brandMonogram,
              { borderColor: brand.accent },
            ]}
          >
            <Text style={[styles.brandMonogramText, { color: brand.text }]}>
              {brand.mark}
            </Text>
          </View>
          <Text
            style={[styles.brandName, { color: brand.text }]}
            numberOfLines={1}
          >
            {data.companyName}
          </Text>
        </View>
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
        <View style={styles.bodyTop}>
          <View style={styles.headerRow}>
            {/* Company name is now in the brand hero — body leads with the
                role so we don't repeat the company twice. */}
            <View style={styles.headerLeft}>
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
        </View>

        <View style={styles.bodyBottom}>
          <BoatVoyage current={current} />
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

const CARD_HEIGHT = 280;
const IMAGE_FLEX = 0.35;
const BODY_FLEX = 0.65;

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
  brandWrap: {
    width: '100%',
    flex: IMAGE_FLEX,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandMonogram: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  brandMonogramText: {
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 26,
    lineHeight: 30,
  },
  brandName: {
    flex: 1,
    fontFamily: 'InstrumentSerif-Regular',
    fontSize: 28,
    letterSpacing: -0.2,
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
  },
  bodyTop: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  bodyBottom: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 2 },
  role: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 22,
    lineHeight: 26,
    color: BLACK,
    letterSpacing: -0.3,
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

});
