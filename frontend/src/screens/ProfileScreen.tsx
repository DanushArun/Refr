import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { Phrase } from '../utils/haptics';
import { colors } from '../theme/colors';
import { Avatar } from '../components/common/Avatar';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { profileApi } from '../services/api';
import { saveDemoRole, type DemoRole } from '../services/demoRoleStorage';
import { DEMO } from '../config/demo';
import { notifyAuthChange } from '../services/auth';
import { MOCK_SEEKER_SESSION, MOCK_REFERRER_SESSION } from '../config/demo';
import { profileStyles as styles } from './profile/profileStyles';
import { useSensorySettings } from '../hooks/useSensorySettings';

interface FullProfile {
  id: number;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  headline?: string;
  endorsementScore?: number;
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
    endorsement_score: number;
    total_referrals: number;
    successful_hires: number;
    verification_status: string;
  };
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const isReferrer = user?.role === 'referrer';
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const sensory = useSensorySettings();

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
    Phrase.pullRefresh();
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleRoleSwitch = useCallback(async () => {
    const nextRole: DemoRole = isReferrer ? 'seeker' : 'referrer';
    try {
      await saveDemoRole(nextRole);
      notifyAuthChange(nextRole === 'seeker' ? MOCK_SEEKER_SESSION : MOCK_REFERRER_SESSION);
      router.replace(
        nextRole === 'seeker' ? '/(seeker-tabs)/discover' : '/(referrer-tabs)/inbox',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      Alert.alert('Could not switch view', message);
    }
  }, [isReferrer]);

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
                  {isReferrer ? 'Endorser' : 'Seeker'}
                </Text>
              </View>
            </View>
          </View>

          {isReferrer && profile?.referrerProfile && (
            <EndorserTrustPanel profile={profile.referrerProfile} />
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
            value={isReferrer ? 'Endorser' : 'Seeker'}
          />
        </View>

        <SensorySettingsSection
          hapticsEnabled={sensory.hapticsEnabled}
          reduceMotionEnabled={sensory.reduceMotionEnabled}
          onHapticsChange={sensory.setHapticsEnabled}
        />

        {/* Demo-only view switcher. */}
        {DEMO.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>View mode</Text>
            <View style={styles.roleSwitchRow}>
              <View style={styles.roleSwitchCopy}>
                <Text style={styles.roleSwitchLabel}>Currently viewing as</Text>
                <Text style={styles.roleSwitchValue}>
                  {isReferrer ? 'Endorser' : 'Seeker'}
                </Text>
              </View>
              <Button
                label={`Switch to ${isReferrer ? 'Seeker' : 'Endorser'}`}
                onPress={handleRoleSwitch}
                variant="secondary"
                size="medium"
                fullWidth={false}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Endorsly</Text>
          <SettingsRow label="Version" value="0.1.0" />
          <SettingsRow label="Market" value="India tech" />
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

function SensorySettingsSection({
  hapticsEnabled,
  reduceMotionEnabled,
  onHapticsChange,
}: {
  hapticsEnabled: boolean;
  reduceMotionEnabled: boolean;
  onHapticsChange: (enabled: boolean) => Promise<void>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      <SettingsToggleRow
        label="Haptics"
        value={hapticsEnabled ? 'On' : 'Off'}
        enabled={hapticsEnabled}
        onChange={onHapticsChange}
      />
      <SettingsRow
        label="Motion"
        value={reduceMotionEnabled ? 'Reduced by system' : 'Full motion'}
      />
    </View>
  );
}

function SettingsToggleRow({
  label,
  value,
  enabled,
  onChange,
}: {
  label: string;
  value: string;
  enabled: boolean;
  onChange: (enabled: boolean) => Promise<void>;
}) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <View style={styles.settingsToggleValue}>
        <Text style={styles.settingsValue}>{value}</Text>
        <Switch
          value={enabled}
          onValueChange={(next) => void onChange(next)}
          thumbColor={enabled ? colors.goldBright : colors.textTertiary}
          trackColor={{ false: colors.surfaceLevel2, true: colors.goldGlow }}
        />
      </View>
    </View>
  );
}

function EndorserTrustPanel({
  profile,
}: {
  profile: NonNullable<FullProfile['referrerProfile']>;
}) {
  return (
    <View style={styles.endorserPanel}>
      <View style={styles.endorserTopRow}>
        <View style={styles.endorserCopy}>
          <Text style={styles.endorserTitle} numberOfLines={1}>
            {profile.job_title}
          </Text>
          <Text style={styles.endorserCompany} numberOfLines={1}>
            {profile.department} · {profile.company.name}
          </Text>
          <Text style={styles.profileDetailSub}>
            {profile.verification_status}
          </Text>
        </View>
        <View style={styles.scoreSeal}>
          <Text style={styles.scoreValue}>{profile.endorsement_score}</Text>
          <Text style={styles.scoreLabel}>ENDORSEMENT{'\n'}SCORE</Text>
        </View>
      </View>
      <Text style={styles.endorserMetrics}>
        {profile.total_referrals} endorsements · {profile.successful_hires} hires
      </Text>
    </View>
  );
}
