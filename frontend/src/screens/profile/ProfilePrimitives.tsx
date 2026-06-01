import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
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
