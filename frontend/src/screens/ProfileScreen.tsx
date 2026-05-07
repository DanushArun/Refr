import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Avatar } from '../components/common/Avatar';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { profileApi } from '../services/api';

interface FullProfile {
  id: number;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  headline?: string;
  kingmakerScore?: number;
  jobTitle?: string;
  companyName?: string;
  seekerProfile?: {
    headline: string;
    career_story: string;
    skills: string[];
    years_of_experience: number;
    target_companies: string[];
    target_roles: string[];
    is_open_to_work: boolean;
  };
  referrerProfile?: {
    company: { id: number; name: string };
    department: string;
    job_title: string;
    kingmaker_score: number;
    total_referrals: number;
    successful_hires: number;
    verification_status: string;
  };
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileApi.getMe() as FullProfile;
      setProfile(data);
    } catch {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) return null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const isReferrer = user.role === 'referrer';
  const displayName = profile?.displayName ?? user.displayName ?? 'User';
  const avatarUrl = profile?.avatarUrl ?? user.avatarUrl;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              uri={avatarUrl}
              displayName={displayName}
              size="xl"
            />
            <View style={styles.profileMeta}>
              <Text style={styles.displayName}>{displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isReferrer ? 'Referrer' : 'Job Seeker'}
                </Text>
              </View>
            </View>
          </View>

          {isReferrer && profile?.referrerProfile && (
            <View style={styles.profileDetail}>
              <Text style={styles.profileDetailText}>
                {profile.referrerProfile.job_title} at{' '}
                {profile.referrerProfile.company.name}
              </Text>
              <Text style={styles.profileDetailSub}>
                Endorsement Score: {profile.referrerProfile.kingmaker_score}
              </Text>
              <View style={styles.statsRow}>
                <StatPill
                  label="Referrals"
                  value={profile.referrerProfile.total_referrals}
                />
                <StatPill
                  label="Hires"
                  value={profile.referrerProfile.successful_hires}
                />
                <StatPill
                  label="Status"
                  value={profile.referrerProfile.verification_status}
                />
              </View>
            </View>
          )}

          {!isReferrer && profile?.seekerProfile && (
            <View style={styles.profileDetail}>
              {profile.seekerProfile.headline ? (
                <Text style={styles.headline} numberOfLines={2}>
                  {profile.seekerProfile.headline}
                </Text>
              ) : null}
              {profile.seekerProfile.skills.length > 0 && (
                <Text style={styles.profileDetailText}>
                  Skills: {profile.seekerProfile.skills.join(', ')}
                </Text>
              )}
              {profile.seekerProfile.target_companies.length > 0 && (
                <Text style={styles.profileDetailSub}>
                  Targeting:{' '}
                  {profile.seekerProfile.target_companies.join(', ')}
                </Text>
              )}
            </View>
          )}
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow label="Email" value={user.email} />
          <SettingsRow
            label="Role"
            value={isReferrer ? 'Referrer' : 'Seeker'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Endorsly</Text>
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

function SettingsRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[8],
    paddingBottom: spacing[20],
    gap: spacing[6],
  },
  profileCard: { gap: spacing[4] },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  profileMeta: { flex: 1, gap: spacing[2] },
  displayName: { ...typography.h3, color: colors.text },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[0.5],
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'Outfit-SemiBold',
  },
  profileDetail: { gap: spacing[2] },
  profileDetailText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileDetailSub: {
    ...typography.caption,
    color: colors.accent,
  },
  headline: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
  },
  statValue: {
    ...typography.h4,
    color: colors.text,
    fontFamily: 'JetBrainsMono-Regular',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  section: {
    gap: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: layout.cardBorderRadius,
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
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  settingsLabel: { ...typography.body, color: colors.text },
  settingsValue: { ...typography.body, color: colors.textSecondary },
  signOutBtn: { marginTop: spacing[4] },
});
