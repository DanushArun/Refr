import React from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components/common/Avatar';
import { PersonName } from '../../../components/common/PersonName';
import { TierBadge } from '../../../components/tier/TierBadge';
import { AmbientBackground } from '../../../components/common/AmbientBackground';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, layout } from '../../../theme/spacing';
import type { EndorserCard } from './endorserCardData';
import type { SeekerCard } from './seekerCardData';

/**
 * Full-screen profile sheet opened by tapping a swipe card.
 * Two flavours: endorser profile (for seeker viewers) and seeker profile
 * (for endorser viewers). Bumble-style: scroll full bio, commit via the
 * action buttons at the bottom. Close button = non-committal dismiss.
 */

interface CommonProps {
  visible: boolean;
  onClose: () => void;
  onPass: () => void;
  onCommit: () => void;
}

export function EndorserProfileSheet({
  visible,
  onClose,
  onPass,
  onCommit,
  card,
}: CommonProps & { card: EndorserCard | null }) {
  if (!card) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.modalRoot}>
        <AmbientBackground />
        <SafeAreaView style={styles.safe}>
          <CloseButton onClose={onClose} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroRow}>
              <Avatar displayName={card.name} size="xl" />
              <View style={styles.heroMeta}>
                <PersonName name={card.name} textStyle={styles.name} />
                <Text style={styles.role}>{card.jobTitle}</Text>
                <Text style={styles.company}>{card.companyName}</Text>
                <View style={styles.badgeRow}>
                  <TierBadge score={card.trustScore} size="md" />
                  <View style={styles.verifiedPill}>
                    <View style={styles.verifiedDot} />
                    <Text style={styles.verifiedText}>Verified employee</Text>
                  </View>
                </View>
              </View>
            </View>

            <Section label="ENDORSEMENT RECORD">
              <View style={styles.statRow}>
                <StatTile label="Trust score" value={String(card.trustScore)} suffix="/100" />
                <StatTile label="Accepts" value={`${card.acceptanceRate}%`} />
                <StatTile label="Hires" value={String(card.hires)} />
                <StatTile label="Response" value={card.responseTime} />
              </View>
            </Section>

            <Section label="SKILLS THEY ENDORSE FOR">
              <View style={styles.chipRow}>
                {card.skills.map((s) => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{s}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section label="ABOUT">
              <Text style={styles.about}>
                Works at <Text style={styles.aboutStrong}>{card.companyName}</Text> as a{' '}
                {card.jobTitle}. Typical response time is {card.responseTime}. Has endorsed{' '}
                {card.hires} successful hire{card.hires === 1 ? '' : 's'} to date. Accepts{' '}
                {card.acceptanceRate}% of incoming requests.
              </Text>
            </Section>

            <Section label="MATCH">
              <View style={styles.matchRow}>
                <Text style={styles.matchLabel}>Your match with {card.name.split(' ')[0]}</Text>
                <View style={styles.matchBar}>
                  <View style={[styles.matchFill, { width: `${card.matchPercent}%` }]} />
                </View>
                <Text style={styles.matchPercent}>{card.matchPercent}%</Text>
              </View>
              <Text style={styles.matchExplain}>
                Computed from your target companies, skill overlap, and experience fit.
              </Text>
            </Section>
          </ScrollView>

          <ActionBar
            passLabel="Pass"
            commitLabel={`Request ${card.name.split(' ')[0]}`}
            onPass={onPass}
            onCommit={onCommit}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function SeekerProfileSheet({
  visible,
  onClose,
  onPass,
  onCommit,
  card,
}: CommonProps & { card: SeekerCard | null }) {
  if (!card) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.safe}>
        <CloseButton onClose={onClose} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroRow}>
            <Avatar displayName={card.name} size="xl" />
            <View style={styles.heroMeta}>
              <Text style={styles.name}>{card.name}</Text>
              <Text style={styles.role}>{card.currentSignal}</Text>
              <Text style={styles.targetRoleText}>Targeting: {card.targetRole}</Text>
            </View>
          </View>

          <Section label="HEADLINE">
            <Text style={styles.headline}>{card.headline}</Text>
          </Section>

          <Section label="CAREER STORY">
            <Text style={styles.story}>{card.fullStory}</Text>
          </Section>

          <Section label="SKILLS">
            <View style={styles.chipRow}>
              {card.fullSkills.map((s) => (
                <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
              ))}
            </View>
          </Section>

          <Section label="TARGET ROLES">
            <View style={styles.chipRow}>
              {card.targetRoles.map((r) => (
                <View key={r} style={[styles.chip, styles.chipPurple]}>
                  <Text style={[styles.chipText, styles.chipTextPurple]}>{r}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section label="WANTS TO JOIN">
            <View style={styles.chipRow}>
              {card.targetCompanies.map((c) => (
                <View key={c} style={[styles.chip, styles.chipPurple]}>
                  <Text style={[styles.chipText, styles.chipTextPurple]}>{c}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section label="MATCH">
            <View style={styles.matchRow}>
              <Text style={styles.matchLabel}>Fit with your company</Text>
              <View style={styles.matchBar}>
                <View style={[styles.matchFill, { width: `${card.matchPercent}%` }]} />
              </View>
              <Text style={styles.matchPercent}>{card.matchPercent}%</Text>
            </View>
            <Text style={styles.matchExplain}>
              {card.targetCompanies.length > 0
                ? `${card.name.split(' ')[0]} is targeting companies in your domain.`
                : 'Based on skill overlap and experience.'}
            </Text>
          </Section>
        </ScrollView>

        <ActionBar
          passLabel="Pass"
          commitLabel={`Accept ${card.name.split(' ')[0]}`}
          onPass={onPass}
          onCommit={onCommit}
        />
      </SafeAreaView>
    </Modal>
  );
}

/* Shared subcomponents */

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.closeRow}>
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function StatTile({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>
        {value}
        {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBar({
  passLabel,
  commitLabel,
  onPass,
  onCommit,
}: {
  passLabel: string;
  commitLabel: string;
  onPass: () => void;
  onCommit: () => void;
}) {
  return (
    <View style={styles.actionBar}>
      <Pressable
        onPress={onPass}
        style={({ pressed }) => [styles.passBtn, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="close" size={22} color={colors.error} />
        <Text style={styles.passText}>{passLabel}</Text>
      </Pressable>
      <Pressable
        onPress={onCommit}
        style={({ pressed }) => [styles.commitBtn, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="heart" size={20} color="#0a0a0b" />
        <Text style={styles.commitText}>{commitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  closeRow: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[3],
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLevel1,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[20],
    gap: spacing[6],
  },
  /* Avatar aligns to TOP so it sits next to the first name when the name
     wraps onto two lines via <PersonName>. */
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
    marginTop: spacing[4],
  },
  heroMeta: { flex: 1, gap: 4 },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.text,
  },
  role: { ...typography.body, color: colors.textSecondary },
  company: { ...typography.caption, color: colors.accent, fontFamily: 'Outfit-SemiBold' },
  targetRoleText: { ...typography.caption, color: colors.accent, fontFamily: 'Outfit-SemiBold' },
  badgeRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing[2.5],
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  verifiedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.success },
  verifiedText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    color: colors.success,
    letterSpacing: 0.4,
  },
  section: { gap: spacing[2] },
  sectionLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statTile: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surfaceLevel2,
    borderRadius: 12,
    padding: spacing[3],
    gap: 2,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 22,
    color: colors.text,
    letterSpacing: 0,
  },
  statSuffix: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: colors.textTertiary,
  },
  statLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    backgroundColor: colors.tagBlue,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: 8,
  },
  chipPurple: { backgroundColor: colors.tagPurple },
  chipText: { fontFamily: 'Outfit-Medium', fontSize: 12, color: colors.tagBlueText },
  chipTextPurple: { color: colors.tagPurpleText },
  about: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  aboutStrong: {
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
  },
  headline: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  story: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  matchLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  matchBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  matchFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  matchPercent: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
    color: colors.text,
    width: 40,
    textAlign: 'right',
  },
  matchExplain: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 16,
  },

  /* Action bar */
  actionBar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  passBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  passText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: colors.error,
  },
  commitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
  },
  commitText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: '#0a0a0b',
  },
});
