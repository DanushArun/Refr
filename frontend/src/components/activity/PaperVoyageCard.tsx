import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReferralStatus } from '@refr/shared';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { officeImageFor } from './companyOffices';
import { BoatVoyage } from './BoatVoyage';
import {
  formatEndorserName,
  StatusPill,
  statusMeta,
} from './referralCardShared';

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
  active?: boolean;
}

export function PaperVoyageCard({ data, active = true }: Props) {
  const meta = statusMeta(data.status, data.stageTimestamp);
  const current = stageIndex(data.status);
  const isHired = data.status === 'hired';
  const endorserDisplay = data.endorserName
    ? formatEndorserName(data.endorserName)
    : '';
  // Office hero — accepts either a bundled local require() or a stock URL
  // via officeImageFor. When a company has no mapped photo we render a
  // neutral navy plate so the layout stays consistent.
  const officeSource = officeImageFor(data.companyName);
  const hasOffice = officeSource != null;

  return (
    <View style={[styles.card, isHired && styles.cardHired]}>
      <View style={styles.brandWrap}>
        {hasOffice ? (
          <Image
            source={officeSource}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.heroFallback]} />
        )}
        <LinearGradient
          colors={[
            'rgba(3, 7, 18, 0.12)',
            'rgba(3, 7, 18, 0.42)',
            'rgba(3, 7, 18, 0.68)',
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageDim}
          pointerEvents="none"
        />
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
            <View style={styles.headerLeft}>
              <Text style={styles.company} numberOfLines={1}>{data.companyName}</Text>
              <Text style={styles.role} numberOfLines={1}>{data.role}</Text>
            </View>
            {/* Right column — status pill on top, endorser line below it,
                both right-aligned. Frees the row beneath so the body reads
                cleaner. */}
            <View style={styles.headerRight}>
              <StatusPill meta={meta} tone="dark" />
              {!!endorserDisplay && (
                <Text style={styles.endorserRight} numberOfLines={1}>
                  <Text style={styles.endorserLabel}>by </Text>
                  {endorserDisplay}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bodyBottom}>
          <BoatVoyage current={current} active={active} tone="dark" />
        </View>
      </View>
    </View>
  );
}

const CARD_HEIGHT = 280;
const IMAGE_FLEX = 0.35;
const BODY_FLEX = 0.65;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: 'rgba(212, 167, 68, 0.16)',
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
    backgroundColor: '#0A1F44',
  },
  /* Neutral plate behind the photo slot when no office image is mapped.
     A flat navy keeps the layout consistent across cards without per-company
     color coding. */
  heroFallback: {
    backgroundColor: '#0A1F44',
  },
  imageHiredSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  imageDim: {
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
  /* Right column of the body header — status pill stacked over the endorser
     line, both right-aligned and tight against the right edge so the left
     column gets all the breathing room. */
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '52%',
  },
  company: {
    fontFamily: 'InstrumentSerif-Italic',
    fontSize: 26,
    lineHeight: 30,
    color: colors.text,
    letterSpacing: -0.4,
  },
  role: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  endorserRight: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.text,
    textAlign: 'right',
  },
  endorserLabel: {
    fontFamily: 'Outfit-Regular',
    color: colors.textTertiary,
  },
});
