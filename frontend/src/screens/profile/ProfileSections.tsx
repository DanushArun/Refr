import React, { useRef } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { useSensorySettings } from '../../hooks/useSensorySettings';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { AboutSection, AccountSection, SensorySettingsSection } from './ProfileControls';
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
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const panelWidth = Math.max(0, Math.min(440, width - layout.screenPaddingH * 2));
  useScrollToTop(scrollRef);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView
        ref={scrollRef}
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
        <View style={[styles.contentPanel, { width: panelWidth }]}>
          <ProfileBody {...props} />
        </View>
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
      <ProfileHeader isReferrer={isReferrer} showDemoSwitch={showDemoSwitch} />
      <ProfileHero
        avatarUrl={profile?.avatarUrl}
        displayName={displayName}
        isReferrer={isReferrer}
        profile={profile}
      />
      <RoleDetails isReferrer={isReferrer} profile={profile} />
      <AccountSection email={email} isReferrer={isReferrer} />
      <SensorySettingsSection sensory={sensory} />
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
