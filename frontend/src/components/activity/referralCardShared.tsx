import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ReferralStatus } from '@refr/shared';

/**
 * Shared building blocks for the seeker's Activity (PaperVoyageCard) and
 * Matches (MatchVoyageCard) cards. Centralising these guarantees both lists
 * stay in lockstep — same status taxonomy, same pill chrome, same
 * date/name micro-rules — instead of drifting through copy-paste.
 */

export const BLACK = '#0F1115';
export const BLACK_70 = 'rgba(15, 17, 21, 0.70)';
export const BLACK_55 = 'rgba(15, 17, 21, 0.55)';
export const BLACK_38 = 'rgba(15, 17, 21, 0.38)';
export const GOLD = '#C8A24B';
export const HIDDEN_ENDORSER_NAME = 'Endorser pending';

export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export interface StatusMeta {
  label: string;
  variant: 'gold' | 'plain' | 'bad';
}

/** One source of truth for "what does this referral status say on a pill?".
 *  Includes the days-in-stage suffix on `submitted` because that's the stage
 *  where wait time matters most to the seeker. */
export function statusMeta(
  status: ReferralStatus,
  ts?: string | null,
): StatusMeta {
  switch (status) {
    case 'hired':
      return { label: 'HIRED', variant: 'gold' };
    case 'interviewing':
      return { label: 'INTERVIEWING', variant: 'plain' };
    case 'submitted': {
      const d = daysSince(ts);
      return {
        label: d != null ? `SUBMITTED · ${d}D` : 'SUBMITTED',
        variant: 'plain',
      };
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

/** Tidy "ARAV  verma" -> "Arav Verma" for display. We fix titlecase here so
 *  the card never has to trust upstream formatting. */
export function formatEndorserName(full?: string | null): string {
  if (!full) return '';
  const trimmed = full.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export function displayEndorserName(full?: string | null): string {
  return formatEndorserName(full) || HIDDEN_ENDORSER_NAME;
}

/** Latest timestamp that's relevant for the current stage — drives the
 *  "X days" suffix and any "by ago" labels. Falls through gracefully when
 *  earlier stages are missing. */
export function latestStageTimestamp(referral: {
  status: ReferralStatus;
  outcomeAt?: string | null;
  submittedAt?: string | null;
  acceptedAt?: string | null;
  requestedAt?: string | null;
}): string | null | undefined {
  const r = referral;
  if (r.status === 'hired')
    return r.outcomeAt ?? r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  if (r.status === 'interviewing')
    return r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  if (r.status === 'submitted')
    return r.submittedAt ?? r.acceptedAt ?? r.requestedAt;
  return r.acceptedAt ?? r.requestedAt;
}

/**
 * Status pill — three visual variants:
 *   - gold: HIRED. Filled gold + drop shadow + ★ glyph for VIP feel.
 *   - bad:  rejected/withdrawn/expired. Light red wash + red text.
 *   - plain: in-flight stages. Letterspaced caps text only, no background,
 *           so it reads as a label rather than a button.
 *
 * `tone` controls text colour for the plain/bad variants so the pill works
 * on cream surfaces (Activity cards) AND on dark navy surfaces (the Matches
 * inbox). Defaults to "light" — the original cream-card behaviour.
 */
export function StatusPill({
  meta,
  tone = 'light',
}: {
  meta: StatusMeta;
  tone?: 'light' | 'dark';
}) {
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
        <Text
          style={[
            styles.pillText,
            tone === 'dark' ? styles.pillTextBadDark : styles.pillTextBad,
          ]}
        >
          {meta.label}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.pillPlain}>
      <Text
        style={[
          styles.pillText,
          tone === 'dark' ? styles.pillTextPlainDark : styles.pillTextPlain,
        ]}
      >
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  /* Dark-tone variants used by the Matches inbox where pills sit on a navy
     glass surface and need light text for legibility. */
  pillTextPlainDark: { color: 'rgba(250, 250, 247, 0.55)' },
  pillTextBadDark: { color: '#FF6B7A' },
});
