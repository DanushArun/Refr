import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { profileStyles as styles } from './profileStyles';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ProfileSurface variant="section">
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </ProfileSurface>
  );
}

export function ProfileSurface({
  variant,
  children,
}: {
  variant: 'hero' | 'section';
  children: React.ReactNode;
}): React.ReactElement {
  const shellStyle = variant === 'hero' ? styles.hero : styles.section;

  return (
    <View style={shellStyle}>
      <LinearGradient
        colors={[
          'rgba(157, 181, 164, 0.36)',
          colors.profileCardSurface,
          'rgba(12, 31, 25, 0.38)',
        ]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={styles.profileCardSurface}
      />
      <LinearGradient
        colors={['rgba(157, 181, 164, 0.18)', colors.profileCardInset, 'transparent']}
        locations={[0, 0.36, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        pointerEvents="none"
        style={styles.profileCardGlow}
      />
      {children}
    </View>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <View style={styles.settingsRow}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={17} color={colors.goldBright} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): React.ReactElement {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
