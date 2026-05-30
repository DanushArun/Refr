import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../common/PressableScale';
import type { ReferralStatus } from '@refr/shared';
import { Avatar } from '../common/Avatar';
import { colors } from '../../theme/colors';
import { formatEndorserName, statusMeta } from '../activity/referralCardShared';
import { StageRail } from './StageRail';

/**
 * Active conversation row — Endorsly-specific shape.
 *
 * Each row is its own pill, not a row in a unified slab. Layout:
 * rail, avatar, participant metadata, then time and stage on the right.
 * The 4-segment vertical rail is the compact pipeline-progress cue.
 *
 * Engineering choices:
 *   1. Stand-alone pill with 8px gap to neighbours — breaks the "infinite
 *      scrolling list" feel of a flat slab. Each conversation reads as its
 *      own object.
 *   2. Asymmetric border-radius (24/16) — gives the row directional weight
 *      so the eye flows left-to-right toward the time/CTA.
 *   3. Vertical stage rail on the left — encodes the referral's pipeline
 *      position visually without consuming horizontal space. Same data the
 *      Activity tab uses, compressed for inbox density.
 *   4. Gold rim (1 px @ 18% alpha) + dark glass surface — consistent with
 *      the rest of the app's nautical glass-morphism language.
 *   5. Press feedback — gold wash + slight scale-down so the row feels like
 *      a tappable artefact, not an inert bullet.
 */

export interface MatchInboxRowData {
  id: string;
  /** The other party's name. From the seeker's POV this is the endorser
   *  they matched with; from the endorser's POV it's the candidate seeker.
   *  Generic naming so the row component works on both sides. */
  participantName: string;
  /** Optional avatar URL for the participant. */
  participantAvatar?: string;
  companyName: string;
  role: string;
  status: ReferralStatus;
  stageTimestamp?: string | null;
  /** Optional last-message preview. When the backend provides this, it
   *  replaces the role/company sub-line. */
  lastMessagePreview?: string | null;
  /** Optional unread count. > 0 lights the unread dot + bolder preview. */
  unreadCount?: number;
}

interface Props {
  data: MatchInboxRowData;
  onPress: () => void;
  /** When set, displayed above the stage label on the right. */
  timeLabel?: string;
}

/**
 * Memoized — within the Matches scroll, the parent re-renders whenever any
 * tier item changes. Without memo, every row re-renders. Custom equality
 * tracks only the fields that actually drive the row's appearance.
 */
function MatchInboxRowImpl({ data, onPress, timeLabel }: Props) {
  const meta = statusMeta(data.status, data.stageTimestamp);
  const display = formatEndorserName(data.participantName) || data.participantName;
  const hasPreview = !!data.lastMessagePreview;
  const subLine = hasPreview
    ? data.lastMessagePreview!
    : `${data.role} · ${data.companyName}`;
  const isUnread = (data.unreadCount ?? 0) > 0;

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      style={[
        styles.pill,
        isUnread && styles.pillUnread,
      ]}
    >
      {/* Vertical stage rail — visual progress, no text */}
      <StageRail status={data.status} />

      <Avatar
        displayName={display}
        uri={data.participantAvatar}
        size="md"
        verificationRing
      />

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {display}
        </Text>
        <Text
          style={[styles.sub, isUnread && styles.subUnread]}
          numberOfLines={1}
        >
          {subLine}
        </Text>
      </View>

      <View style={styles.right}>
        {!!timeLabel && (
          <Text style={[styles.time, isUnread && styles.timeUnread]}>
            {timeLabel}
          </Text>
        )}
        <Text style={styles.stageTag} numberOfLines={1}>
          {meta.label}
        </Text>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    </PressableScale>
  );
}

export const MatchInboxRow = React.memo(MatchInboxRowImpl, (prev, next) =>
  prev.data.id === next.data.id &&
  prev.data.status === next.data.status &&
  prev.data.participantName === next.data.participantName &&
  prev.data.participantAvatar === next.data.participantAvatar &&
  prev.data.companyName === next.data.companyName &&
  prev.data.role === next.data.role &&
  prev.data.stageTimestamp === next.data.stageTimestamp &&
  prev.data.lastMessagePreview === next.data.lastMessagePreview &&
  prev.data.unreadCount === next.data.unreadCount &&
  prev.timeLabel === next.timeLabel &&
  prev.onPress === next.onPress
);

const styles = StyleSheet.create({
  /* Pill is the row container — own surface, own rim, own shadow. The
     asymmetric border-radius (top-left 24, bottom-right 16) gives a subtle
     directional flow toward the time stamp. */
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  /* Unread state lifts the rim to full gold + adds a soft shadow halo so
     the row reads as "needs attention" before the eye even parses content. */
  pillUnread: {
    borderColor: 'rgba(212, 167, 68, 0.55)',
    backgroundColor: 'rgba(212, 167, 68, 0.08)',
    shadowColor: colors.gold,
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  // pillPressed removed — PressableScale now handles the pressed-state
  // transform consistently with every other tap target in the app.

  middle: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0,
  },
  sub: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  subUnread: {
    fontFamily: 'Outfit-Medium',
    color: colors.text,
  },

  right: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 64,
  },
  time: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.4,
  },
  timeUnread: {
    color: colors.gold,
  },
  /* Stage label is a tiny letterspaced caps line — replaces the heavier
     StatusPill on cream surfaces. Lighter glyph weight on dark glass keeps
     the row uncluttered. */
  stageTag: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9.5,
    color: 'rgba(250, 250, 247, 0.55)',
    letterSpacing: 1.4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
