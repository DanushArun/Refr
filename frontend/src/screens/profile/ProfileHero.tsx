import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { profileStyles as styles } from './profileStyles';
import { InfoRow, Metric, ProfileSurface, Section } from './ProfilePrimitives';
import { formatExperience, formatStatus, getIdentityLine } from './profileUtils';
import type { FullProfile, ReferrerProfile, SeekerProfile } from './profileTypes';
import { ViewModeTopButton } from './ProfileControls';

export function ProfileHeader({
  isReferrer,
  showDemoSwitch,
}: {
  isReferrer: boolean;
  showDemoSwitch: boolean;
}): React.ReactElement {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderCopy}>
        <Text style={styles.eyebrow}>{isReferrer ? 'Endorser profile' : 'Seeker profile'}</Text>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>
      {showDemoSwitch ? <ViewModeTopButton isReferrer={isReferrer} /> : null}
    </View>
  );
}

export function ProfileHero({
  avatarUrl,
  displayName,
  isReferrer,
  profile,
}: {
  avatarUrl?: string;
  displayName: string;
  isReferrer: boolean;
  profile: FullProfile | null;
}): React.ReactElement {
  const identityLine = getIdentityLine(profile, isReferrer);

  return (
    <ProfileSurface variant="hero">
      <View style={styles.heroTop}>
        <Avatar
          uri={avatarUrl}
          displayName={displayName}
          size="lg"
          verificationRing={isReferrer}
        />
        <View style={styles.heroCopy}>
          <RoleBadge isReferrer={isReferrer} />
          <Text style={styles.displayName} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={styles.identityLine} numberOfLines={2}>
            {identityLine}
          </Text>
        </View>
        {isReferrer && profile?.referrerProfile ? (
          <EndorsementScore score={profile.referrerProfile.endorsement_score} />
        ) : null}
      </View>
      {isReferrer && profile?.referrerProfile ? (
        <EndorserSnapshot profile={profile.referrerProfile} />
      ) : null}
      {!isReferrer && profile?.seekerProfile ? (
        <SeekerSnapshot profile={profile.seekerProfile} />
      ) : null}
    </ProfileSurface>
  );
}

export function RoleDetails({
  isReferrer,
  profile,
}: {
  isReferrer: boolean;
  profile: FullProfile | null;
}): React.ReactElement | null {
  if (isReferrer && profile?.referrerProfile) {
    return <EndorserDetails profile={profile.referrerProfile} />;
  }
  if (!isReferrer && profile?.seekerProfile) {
    return <SeekerDetails profile={profile.seekerProfile} />;
  }
  return null;
}

function RoleBadge({ isReferrer }: { isReferrer: boolean }): React.ReactElement {
  return (
    <View style={styles.roleBadge}>
      <Ionicons
        name={isReferrer ? 'shield-checkmark-outline' : 'person-circle-outline'}
        size={13}
        color={colors.navyDeep}
      />
      <Text style={styles.roleBadgeText}>{isReferrer ? 'Endorser' : 'Seeker'}</Text>
    </View>
  );
}

function EndorserSnapshot({ profile }: { profile: ReferrerProfile }): React.ReactElement {
  return (
    <View style={styles.snapshot}>
      <View style={styles.metricRow}>
        <Metric label="Endorsements" value={profile.total_referrals} />
        <Metric label="Hires" value={profile.successful_hires} />
      </View>
    </View>
  );
}

function EndorsementScore({ score }: { score: number }): React.ReactElement {
  return (
    <View style={styles.heroScore}>
      <View style={styles.scoreBlock}>
        <Text style={styles.scoreLabel} numberOfLines={2}>
          Endorsement Score
        </Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
    </View>
  );
}

function SeekerSnapshot({ profile }: { profile: SeekerProfile }): React.ReactElement {
  return (
    <View style={styles.snapshot}>
      <Text style={styles.seekerHeadline} numberOfLines={2}>
        {profile.headline || 'Open to selective endorsements'}
      </Text>
      <View style={styles.metricRow}>
        <Metric label="Experience" value={formatExperience(profile.years_of_experience)} />
        <Metric label="Open" value={profile.is_open_to_work ? 'Yes' : 'No'} />
        <Metric label="Targets" value={profile.target_companies.length} />
      </View>
    </View>
  );
}

function EndorserDetails({ profile }: { profile: ReferrerProfile }): React.ReactElement {
  return (
    <Section title="Professional trust">
      <InfoRow icon="briefcase-outline" label="Role" value={profile.job_title} />
      <InfoRow icon="business-outline" label="Company" value={profile.company.name} />
      <InfoRow icon="git-branch-outline" label="Department" value={profile.department} />
      <InfoRow
        icon="checkmark-circle-outline"
        label="Verification"
        value={formatStatus(profile.verification_status)}
      />
    </Section>
  );
}

function SeekerDetails({ profile }: { profile: SeekerProfile }): React.ReactElement {
  return (
    <Section title="Career signal">
      <ChipGroup title="Target roles" values={profile.target_roles} />
      <ChipGroup title="Target companies" values={profile.target_companies} />
      <ChipGroup title="Skills" values={profile.skills} />
    </Section>
  );
}

function ChipGroup({ title, values }: { title: string; values: string[] }): React.ReactElement {
  return (
    <View style={styles.chipGroup}>
      <Text style={styles.chipGroupTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {values.length > 0 ? (
          values.slice(0, 8).map((value) => (
            <View key={`${title}-${value}`} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Not set</Text>
        )}
      </View>
    </View>
  );
}
