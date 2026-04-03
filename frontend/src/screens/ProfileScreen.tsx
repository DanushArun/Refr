import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import type { UserProfile, ReferrerProfile, SeekerProfile } from '@refr/shared';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) return null;

  const isReferrer = user.role === 'referrer';
  const profile = user as unknown as UserProfile;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar uri={user.avatarUrl} displayName={user.displayName || 'User'} size="xl" />
            <View style={styles.profileMeta}>
              <Text style={styles.displayName}>{user.displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isReferrer ? 'Referrer' : 'Job Seeker'}
                </Text>
              </View>
            </View>
          </View>

          {isReferrer && 'jobTitle' in profile && (
            <View style={styles.profileDetail}>
              <Text style={styles.profileDetailText}>
                {(profile as ReferrerProfile).jobTitle} at {(profile as ReferrerProfile).company}
              </Text>
              <Text style={styles.profileDetailSub}>
                Kingmaker Score: {(profile as ReferrerProfile).kingmakerScore}
              </Text>
            </View>
          )}

          {!isReferrer && 'headline' in profile && (
            <Text style={styles.headline} numberOfLines={2}>
              {(profile as SeekerProfile).headline}
            </Text>
          )}
        </GlassCard>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow label="Email" value={user.email} />
          <SettingsRow label="Role" value={isReferrer ? 'Referrer' : 'Seeker'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About REFR</Text>
          <SettingsRow label="Version" value="0.1.0" />
          <SettingsRow label="Market" value="Bangalore tech" />
        </View>

        <Button
          label="Sign out"
          onPress={handleSignOut}
          variant="text"
          size="large"
          fullWidth
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: spacing[20],
    gap: spacing[6],
  },
  profileCard: { gap: spacing[4] },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  profileMeta: { flex: 1, gap: spacing[2] },
  displayName: { ...typography.h3, color: colors.text },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
    borderRadius: 100,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  roleBadgeText: { ...typography.caption, color: colors.accent, fontFamily: 'Outfit-SemiBold' },
  profileDetail: { gap: spacing[1] },
  profileDetailText: { ...typography.body, color: colors.textSecondary },
  profileDetailSub: { ...typography.caption, color: colors.accent },
  headline: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  section: {
    gap: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing[3.5],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingsLabel: { ...typography.body, color: colors.text },
  settingsValue: { ...typography.body, color: colors.textSecondary },
  signOutBtn: { marginTop: spacing[4] },
});
