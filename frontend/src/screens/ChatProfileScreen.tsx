import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { colors } from '../theme/colors';
import { navigateAfterPress } from '../utils/navigationAfterPress';
import type { HeaderAction } from './chat/useChatController';
import type {
  ReadinessItem,
  ReadinessState,
  ReadinessSummary,
} from './chat/chatReadiness';
import {
  nextActionText,
  profileSubtitle,
  roleText,
  type ChatProfileController,
  type ProfileActionIcon,
  type ProfileParams,
  useChatProfileController,
} from './chatProfile/useChatProfileController';
import { chatProfileStyles as styles } from './chatProfileStyles';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function ChatProfileScreen(): React.ReactElement {
  const controller = useChatProfileController();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileNav title={profileTitle(controller)} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Hero params={controller.params} />
        <ActionGrid controller={controller} />
        {controller.viewerRole === 'endorser' ? (
          <EndorserView controller={controller} />
        ) : (
          <SeekerView params={controller.params} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileNav({ title }: { title: string }): React.ReactElement {
  return (
    <View style={styles.nav}>
      <PressableScale
        accessibilityLabel="Back to chat"
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => navigateAfterPress(() => router.back())}
        pressedScale={0.92}
        pressedOpacity={0.7}
        style={styles.navSide}
      >
        <Ionicons name="chevron-back" size={28} color={colors.text} />
      </PressableScale>
      <Text style={styles.navTitle}>{title}</Text>
      <View style={styles.navSide} />
    </View>
  );
}

function profileTitle(controller: ChatProfileController): string {
  if (controller.viewerRole === 'endorser') return 'Candidate info';
  return 'Advocate info';
}

function Hero({ params }: { params: ProfileParams }): React.ReactElement {
  return (
    <View style={styles.hero}>
      <Avatar
        displayName={params.participantName}
        uri={params.participantAvatar}
        size="xl"
      />
      <Text style={styles.name} numberOfLines={1}>{params.participantName}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{profileSubtitle(params)}</Text>
    </View>
  );
}

function ActionGrid({
  controller,
}: {
  controller: ChatProfileController;
}): React.ReactElement {
  return (
    <View style={styles.actionGrid}>
      <ActionTile
        icon="chatbubble-ellipses-outline"
        label="Message"
        onPress={() => navigateAfterPress(() => router.back())}
      />
      <ActionTile
        disabled={controller.actionDisabled}
        icon={controller.actionIcon}
        label={controller.actionLabel}
        onPress={controller.handlePrimaryAction}
        primary
      />
    </View>
  );
}

function EndorserView({
  controller,
}: {
  controller: ChatProfileController;
}): React.ReactElement {
  return (
    <>
      <ReadinessSection
        action={controller.action}
        loading={controller.state.loading}
        summary={controller.summary}
      />
      <InfoSection title="Candidate">
        <InfoRow icon="briefcase-outline" label="Target role" value={roleText(controller.params)} />
        <InfoRow icon="business-outline" label="Company" value={controller.params.companyName} />
        <InfoRow icon="shield-checkmark-outline" label="Trust" value="Identity-attached action" />
      </InfoSection>
    </>
  );
}

function SeekerView({ params }: { params: ProfileParams }): React.ReactElement {
  return (
    <InfoSection title="Endorser">
      <InfoRow icon="business-outline" label="Company" value={params.companyName} />
      <InfoRow icon="briefcase-outline" label="Role" value={profileSubtitle(params)} />
      <InfoRow icon="shield-checkmark-outline" label="Trust" value="Verified profile context" />
    </InfoSection>
  );
}

function ReadinessSection({
  action,
  loading,
  summary,
}: {
  action: HeaderAction | null;
  loading: boolean;
  summary: ReadinessSummary;
}): React.ReactElement {
  return (
    <InfoSection title="Endorsement readiness">
      <View style={styles.readinessTop}>
        <View style={styles.readinessCopy}>
          <Text style={styles.statusTitle}>{summary.statusLabel}</Text>
          <Text style={styles.statusDetail}>{summary.statusDetail}</Text>
        </View>
        <StatusPill summary={summary} />
      </View>
      {loading ? <LoadingRow /> : <ReadinessRail items={summary.items} />}
      <InfoRow icon={actionIcon(action)} label="Next action" value={nextActionText(action)} />
    </InfoSection>
  );
}

function ReadinessRail({ items }: { items: ReadinessItem[] }): React.ReactElement {
  return (
    <View style={styles.rail}>
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          <ReadinessDot state={item.state} />
          {index < items.length - 1 && <View style={connectorStyle(item.state)} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function ReadinessDot({ state }: { state: ReadinessState }): React.ReactElement {
  const icon = state === 'complete' ? 'checkmark' : 'ellipse';
  return (
    <View style={[styles.dot, dotStyle(state)]}>
      <Ionicons name={icon} size={12} color={dotIconColor(state)} />
    </View>
  );
}

function InfoSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={24} color={colors.text} />
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionTile({
  disabled = false,
  icon,
  label,
  onPress,
  primary = false,
}: {
  disabled?: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
}): React.ReactElement {
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      pressedScale={0.96}
      pressedOpacity={0.82}
      style={[
        styles.actionTile,
        primary && styles.actionTilePrimary,
        disabled && styles.actionTileDisabled,
      ]}
    >
      <Ionicons name={icon} size={28} color={primary ? colors.accent : colors.text} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </PressableScale>
  );
}

function StatusPill({ summary }: { summary: ReadinessSummary }): React.ReactElement {
  const color = statusColor(summary);
  return (
    <View style={[styles.statusPill, { backgroundColor: `${color}18`, borderColor: `${color}55` }]}>
      <Ionicons name="shield-checkmark" size={15} color={color} />
      <Text style={[styles.statusPillText, { color }]}>{summary.completedCount}/4</Text>
    </View>
  );
}

function LoadingRow(): React.ReactElement {
  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator size="small" color={colors.accent} />
    </View>
  );
}

function actionIcon(action: HeaderAction | null): ProfileActionIcon {
  if (action?.label === 'Record outcome') return 'flag-outline';
  if (action?.label === 'Mark interviewing') return 'people-outline';
  if (action?.label === 'Submit to HR') return 'send-outline';
  return 'checkmark-circle-outline';
}

function statusColor(summary: ReadinessSummary): string {
  if (summary.hrNoteReady) return colors.success;
  if (summary.readyForSubmission) return colors.accent;
  return colors.warning;
}

function connectorStyle(state: ReadinessState): object {
  return [styles.connector, { backgroundColor: readinessColor(state) }];
}

function dotStyle(state: ReadinessState): object {
  const color = readinessColor(state);
  if (state === 'complete') return { backgroundColor: color, borderColor: color };
  return { backgroundColor: `${color}20`, borderColor: `${color}66` };
}

function dotIconColor(state: ReadinessState): string {
  if (state === 'complete') return colors.background;
  return readinessColor(state);
}

function readinessColor(state: ReadinessState): string {
  if (state === 'complete') return colors.success;
  if (state === 'current') return colors.accent;
  return colors.textTertiary;
}
