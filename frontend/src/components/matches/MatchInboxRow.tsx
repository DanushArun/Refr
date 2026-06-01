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
 * This is a list item, not a boxed card. The parent list owns the top rule;
 * each row draws one bottom divider so conversations read as a clean ledger.
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
      pressedScale={0.995}
      pressedOpacity={0.76}
      style={[
        styles.row,
        isUnread && styles.rowUnread,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    paddingLeft: 6,
    paddingRight: 2,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(250, 250, 247, 0.10)',
  },
  rowUnread: {
    backgroundColor: 'rgba(212, 167, 68, 0.045)',
    borderBottomColor: 'rgba(212, 167, 68, 0.26)',
  },

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
