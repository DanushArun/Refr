import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { DEMO } from '../config/demo';
import { useAuth } from '../hooks/useAuth';
import { useSensorySettings } from '../hooks/useSensorySettings';
import { profileApi } from '../services/api';
import { Phrase } from '../utils/haptics';
import {
  getErrorMessage,
  ProfileContent,
  ProfileLoading,
} from './profile/ProfileSections';
import type { FullProfile } from './profile/profileTypes';

export function ProfileScreen(): React.ReactElement | null {
  const { user, signOut } = useAuth();
  const profileState = useProfileState(Boolean(user));
  const sensory = useSensorySettings();

  if (!user) return null;
  if (profileState.loading) return <ProfileLoading />;

  return (
    <ProfileContent
      email={user.email}
      isReferrer={user.role === 'referrer'}
      profile={profileState.profile}
      refreshing={profileState.refreshing}
      sensory={sensory}
      showDemoSwitch={DEMO.enabled}
      onRefresh={profileState.refresh}
      onSignOut={signOut}
    />
  );
}

function useProfileState(enabled: boolean): {
  loading: boolean;
  profile: FullProfile | null;
  refreshing: boolean;
  refresh: () => void;
} {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      const data = await profileApi.getMe();
      setProfile(data as FullProfile);
    } catch (error: unknown) {
      Alert.alert('Profile unavailable', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void fetchProfile();
  }, [enabled, fetchProfile]);

  const handleRefresh = useCallback((): void => {
    if (!enabled) return;
    Phrase.pullRefresh();
    setRefreshing(true);
    void fetchProfile();
  }, [enabled, fetchProfile]);

  return { loading, profile, refreshing, refresh: handleRefresh };
}
