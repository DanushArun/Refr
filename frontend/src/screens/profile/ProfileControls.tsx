import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '../../components/common/Button';
import { MOCK_REFERRER_SESSION, MOCK_SEEKER_SESSION } from '../../config/demo';
import { useSensorySettings } from '../../hooks/useSensorySettings';
import { notifyAuthChange } from '../../services/auth';
import { saveDemoRole, type DemoRole } from '../../services/demoRoleStorage';
import { colors } from '../../theme/colors';
import { getErrorMessage } from './profileUtils';
import { InfoRow, Section, type IconName } from './ProfilePrimitives';
import { profileStyles as styles } from './profileStyles';

export function AccountSection({
  email,
  isReferrer,
}: {
  email: string;
  isReferrer: boolean;
}): React.ReactElement {
  return (
    <Section title="Account">
      <InfoRow icon="mail-outline" label="Email" value={email} />
      <InfoRow icon="id-card-outline" label="Role" value={isReferrer ? 'Endorser' : 'Seeker'} />
    </Section>
  );
}

export function SensorySettingsSection({
  sensory,
}: {
  sensory: ReturnType<typeof useSensorySettings>;
}): React.ReactElement {
  return (
    <Section title="Experience">
      <SettingsToggleRow
        enabled={sensory.hapticsEnabled}
        icon="finger-print-outline"
        label="Haptics"
        onChange={sensory.setHapticsEnabled}
        value={sensory.hapticsEnabled ? 'On' : 'Off'}
      />
      <InfoRow
        icon="accessibility-outline"
        label="Motion"
        value={sensory.reduceMotionEnabled ? 'Reduced by system' : 'Full motion'}
      />
    </Section>
  );
}

export function ViewModeTopButton({ isReferrer }: { isReferrer: boolean }): React.ReactElement {
  return (
    <Button
      label={`Switch to ${isReferrer ? 'Seeker' : 'Endorser'}`}
      onPress={() => void switchDemoRole(isReferrer)}
      variant="secondary"
      size="small"
      fullWidth={false}
    />
  );
}

export function AboutSection(): React.ReactElement {
  return (
    <Section title="About Endorsly">
      <InfoRow icon="phone-portrait-outline" label="Version" value="0.1.0" />
    </Section>
  );
}

function SettingsToggleRow({
  enabled,
  icon,
  label,
  onChange,
  value,
}: {
  enabled: boolean;
  icon: IconName;
  label: string;
  onChange: (enabled: boolean) => Promise<void>;
  value: string;
}): React.ReactElement {
  const handleChange = (next: boolean): void => {
    onChange(next).catch((error: unknown) => {
      Alert.alert('Could not update setting', getErrorMessage(error));
    });
  };

  return (
    <View style={styles.settingsRow}>
      <InfoRowIcon icon={icon} />
      <Text style={styles.settingsLabel}>{label}</Text>
      <View style={styles.settingsToggleValue}>
        <Text style={styles.settingsValue}>{value}</Text>
        <Switch
          value={enabled}
          onValueChange={handleChange}
          thumbColor={enabled ? colors.goldBright : colors.textTertiary}
          trackColor={{ false: colors.surfaceLevel2, true: colors.goldGlow }}
        />
      </View>
    </View>
  );
}

function InfoRowIcon({ icon }: { icon: IconName }): React.ReactElement {
  return (
    <View style={styles.rowIcon}>
      <Ionicons name={icon} size={17} color={colors.goldBright} />
    </View>
  );
}

async function switchDemoRole(isReferrer: boolean): Promise<void> {
  const nextRole: DemoRole = isReferrer ? 'seeker' : 'referrer';
  try {
    await saveDemoRole(nextRole);
    notifyAuthChange(nextRole === 'seeker' ? MOCK_SEEKER_SESSION : MOCK_REFERRER_SESSION);
    router.replace(
      nextRole === 'seeker' ? '/(seeker-tabs)/discover' : '/(referrer-tabs)/discover',
    );
  } catch (error: unknown) {
    Alert.alert('Could not switch view', getErrorMessage(error));
  }
}
