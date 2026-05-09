import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReferralStatus } from '@refr/shared';
import { Avatar } from '../common/Avatar';
import { colors } from '../../theme/colors';
import {
  formatEndorserName,
  StatusPill,
  statusMeta,
} from '../activity/referralCardShared';

/**
 * Single row in the Matches inbox. Compact (~72 px) so 8 fit on a screen,
 * built for the daily-scan job. Whole row is the chat-open target.
 *
 * Designed for a dark glass surface — light text on translucent navy, gold
 * accents for unread/active state. Sits flush with the rest of the app's
 * glass-morphism language instead of borrowing the cream credit-card look
 * from Activity.
 *
 * Layout:
 *   [avatar] [name + sub-line]                         [time]
 *                                                       [stage pill]
 *
 * `dimmed` fades the row's avatar + content to ~0.55 — used by the resting
 * section so stale matches read as historical without being deleted.
 */

export interface MatchInboxRowData {
  id: string;
  endorserName: string;
  companyName: string;
  role: string;
  status: ReferralStatus;
  /** Most recent stage timestamp — drives the time label and the pill's
   *  day-context suffix. */
  stageTimestamp?: string | null;
  /** Optional last-message preview. When the backend provides this, it
   *  replaces the role/company sub-line. Until then, sub-line shows context. */
  lastMessagePreview?: string | null;
  /** Optional unread count. When > 0, the row gets a gold dot + bolder
   *  preview + gold timestamp. */
  unreadCount?: number;
}

interface Props {
  data: MatchInboxRowData;
  onPress: () => void;
  /** When true, render at reduced opacity for the resting section. */
  dimmed?: boolean;
  /** Custom right-side time label (e.g. "2h", "Yesterday"). */
  timeLabel?: string;
}

export function MatchInboxRow({ data, onPress, dimmed, timeLabel }: Props) {
  const meta = statusMeta(data.status, data.stageTimestamp);
  const display = formatEndorserName(data.endorserName) || data.endorserName;
  const hasPreview = !!data.lastMessagePreview;
  const subLine = hasPreview
    ? data.lastMessagePreview!
    : `${data.role} · ${data.companyName}`;
  const isUnread = (data.unreadCount ?? 0) > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.contents, dimmed && styles.contentsDimmed]}>
        <Avatar displayName={display} size="md" verificationRing />

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
          <View style={styles.pillSlot}>
            <StatusPill meta={meta} tone="dark" />
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </Pressable>
  );
}

const ROW_HEIGHT = 76;

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  /* Press-feedback uses a faint gold wash so the affordance reads as
     intentional on the dark glass surface. */
  rowPressed: {
    backgroundColor: 'rgba(212, 167, 68, 0.06)',
  },
  contents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contentsDimmed: {
    opacity: 0.5,
  },
  middle: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.1,
  },
  sub: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  /* Unread bumps the preview to a stronger weight + lighter color so the
     eye lands on it during scan. Mirrors WhatsApp/iMessage convention. */
  subUnread: {
    fontFamily: 'Outfit-Medium',
    color: colors.text,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 64,
  },
  time: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  timeUnread: {
    color: colors.gold,
    fontFamily: 'Outfit-Bold',
  },
  pillSlot: {
    alignItems: 'flex-end',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
