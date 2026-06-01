import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { useSensorySettings } from '../../hooks/useSensorySettings';
import { colors } from '../../theme/colors';
import {
  AboutSection,
  AccountSection,
  SensorySettingsSection,
  ViewModeSection,
} from './ProfileControls';
import { ProfileHeader, ProfileHero, RoleDetails } from './ProfileHero';
import { getErrorMessage } from './profileUtils';
import { profileStyles as styles } from './profileStyles';
import type { FullProfile } from './profileTypes';

export { getErrorMessage };

type ProfileContentProps = {
  email: string;
  isReferrer: boolean;
  profile: FullProfile | null;
  refreshing: boolean;
  sensory: ReturnType<typeof useSensorySettings>;
  showDemoSwitch: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
};

export function ProfileContent(props: ProfileContentProps): React.ReactElement {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <ProfileBody {...props} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileBody({
  email,
  isReferrer,
  profile,
  sensory,
  showDemoSwitch,
  onSignOut,
}: ProfileContentProps): React.ReactElement {
  const displayName = profile?.displayName ?? 'User';

  return (
    <>
      <ProfileHeader isReferrer={isReferrer} />
      <ProfileHero
        avatarUrl={profile?.avatarUrl}
        displayName={displayName}
        isReferrer={isReferrer}
        profile={profile}
      />
      <RoleDetails isReferrer={isReferrer} profile={profile} />
      <AccountSection email={email} isReferrer={isReferrer} />
      <SensorySettingsSection sensory={sensory} />
      {showDemoSwitch && <ViewModeSection isReferrer={isReferrer} />}
      <AboutSection />
      <Button
        label="Sign out"
        onPress={() => confirmSignOut(onSignOut)}
        variant="text"
        size="large"
        fullWidth
        style={styles.signOutBtn}
      />
    </>
  );
}

export function ProfileLoading(): React.ReactElement {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </SafeAreaView>
  );
}

function confirmSignOut(onSignOut: () => void): void {
  Alert.alert('Sign out?', 'You will need to sign in again.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: onSignOut },
  ]);
}
