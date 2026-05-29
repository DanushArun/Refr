import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PipelineStage } from '../components/activity/PipelineStepper';
import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import {
  useChatController,
  type ChatController,
  type HeaderAction,
} from './chat/useChatController';
import { MessageList } from './chat/ChatMessages';
import { chatStyles as styles } from './chat/chatStyles';
import { REACTION_EMOJIS } from './chat/chatLogic';

export function ChatScreen(): React.ReactElement {
  const controller = useChatController();

  if (controller.loading) return <ChatLoading />;
  return <ChatView controller={controller} />;
}

function ChatLoading(): React.ReactElement {
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </View>
  );
}

function ChatView({ controller }: { controller: ChatController }): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader controller={controller} topInset={insets.top} />
      <ChatBody controller={controller} bottomInset={insets.bottom} />
      <ReactionPicker controller={controller} />
    </View>
  );
}

function ChatHeader({
  controller,
  topInset,
}: {
  controller: ChatController;
  topInset: number;
}): React.ReactElement {
  const sub = controller.targetRole
    ? `${controller.targetRole} · ${controller.companyName}`
    : controller.companyName;

  return (
    <View style={[styles.headerShell, { paddingTop: topInset + spacing[2] }]}>
      <View style={styles.headerTopRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.controlPressed]}
        >
          <Ionicons name="chevron-back" size={23} color={colors.text} />
        </Pressable>
        <Avatar
          displayName={controller.participantName}
          uri={controller.participantAvatar}
          size="md"
          verificationRing
        />
        <View style={styles.headerMeta}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName} numberOfLines={1}>
              {controller.participantName}
            </Text>
            <StageBadge stage={controller.stage} />
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>
            {controller.typing ? <Text style={styles.typingInline}>typing...</Text> : sub}
          </Text>
        </View>
      </View>
      <ChatStagePanel controller={controller} />
    </View>
  );
}

function ChatStagePanel({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <View style={styles.stagePanel}>
      <ChatStageRail stage={controller.stage} />
      <View style={styles.stagePanelFooter}>
        <View style={styles.stagePanelCopy}>
          <Text style={styles.stagePanelText} numberOfLines={1}>
            Current: {stageLabel(controller.stage)}
          </Text>
          <Text style={styles.stagePanelMeta} numberOfLines={1}>
            {controller.companyName}
          </Text>
        </View>
        {controller.headerAction && (
          <HeaderActionButton
            action={controller.headerAction}
            pending={controller.stagePending}
            onPress={controller.handleHeaderAction}
          />
        )}
      </View>
    </View>
  );
}

function StageBadge({ stage }: { stage: PipelineStage }): React.ReactElement {
  return (
    <View style={styles.stageBadge}>
      <Text style={styles.stageBadgeText}>{stageLabel(stage).toUpperCase()}</Text>
    </View>
  );
}

function ChatStageRail({ stage }: { stage: PipelineStage }): React.ReactElement {
  const current = stageIndex(stage);

  return (
    <View style={styles.stageRail}>
      {CHAT_STAGES.map((step, index) => {
        const active = index === current;
        const complete = index < current;
        return (
          <View key={step.key} style={styles.stageStep}>
            <View
              style={[
                styles.stageSegment,
                complete && styles.stageSegmentComplete,
                active && styles.stageSegmentActive,
              ]}
            />
            <Text
              style={[
                styles.stageStepText,
                complete && styles.stageStepTextComplete,
                active && styles.stageStepTextActive,
              ]}
              numberOfLines={1}
            >
              {step.short}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function HeaderActionButton({
  action,
  pending,
  onPress,
}: {
  action: HeaderAction;
  pending: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      disabled={pending}
      style={({ pressed }) => [
        styles.actionBtn,
        pressed && styles.controlPressed,
        pending && { opacity: 0.5 },
      ]}
    >
      <Text style={styles.actionBtnText} numberOfLines={1}>
        {pending ? 'Updating...' : action.label}
      </Text>
      <Ionicons name="arrow-forward" size={14} color={colors.background} />
    </Pressable>
  );
}

function ChatBody({
  controller,
  bottomInset,
}: {
  controller: ChatController;
  bottomInset: number;
}): React.ReactElement {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.kav}
      keyboardVerticalOffset={0}
    >
      <MessageList
        groups={controller.grouped}
        viewerId={controller.viewerId}
        deliveryStates={controller.deliveryStates}
        reactions={controller.reactions}
        typing={controller.typing}
        onLongPress={controller.openReactionPicker}
      />
      <View
        style={[
          styles.composerDock,
          { paddingBottom: Math.max(bottomInset, spacing[3]) },
        ]}
      >
        <QuickReplies controller={controller} />
        <Composer controller={controller} />
      </View>
    </KeyboardAvoidingView>
  );
}

function QuickReplies({ controller }: { controller: ChatController }): React.ReactElement | null {
  if (controller.draft.length > 0 || controller.quickReplies.length === 0) return null;

  return (
    <View style={styles.quickRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickScroll}
      >
        {controller.quickReplies.map((reply) => (
          <PressableScale
            key={reply}
            onPress={() => void controller.handleSend(reply)}
            style={styles.quickChip}
          >
            <Text style={styles.quickChipText}>{reply}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

function Composer({ controller }: { controller: ChatController }): React.ReactElement {
  const disabled = !controller.draft.trim() || controller.sending;

  return (
    <View style={styles.inputRow}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={controller.draft}
          onChangeText={controller.setDraft}
          placeholder="Message"
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={4000}
        />
      </View>
      <Pressable
        onPress={() => void controller.handleSend()}
        disabled={disabled}
        style={({ pressed }) => [
          styles.sendBtn,
          disabled && styles.sendBtnDisabled,
          pressed && !disabled && styles.controlPressed,
        ]}
      >
        {controller.sending ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Ionicons name="arrow-up" size={20} color={colors.background} />
        )}
      </Pressable>
    </View>
  );
}

const CHAT_STAGES: { key: PipelineStage; short: string; label: string }[] = [
  { key: 'matched', short: 'Match', label: 'Matched' },
  { key: 'submitted', short: 'Submit', label: 'Submitted' },
  { key: 'interviewing', short: 'Loop', label: 'Interviewing' },
  { key: 'hired', short: 'Hire', label: 'Hired' },
];

function normalizedStage(stage: PipelineStage): PipelineStage {
  if (stage === 'accepted' || stage === 'requested') return 'matched';
  return stage;
}

function stageIndex(stage: PipelineStage): number {
  const normalized = normalizedStage(stage);
  const found = CHAT_STAGES.findIndex((step) => step.key === normalized);
  if (found >= 0) return found;
  return CHAT_STAGES.length - 1;
}

function stageLabel(stage: PipelineStage): string {
  const normalized = normalizedStage(stage);
  if (normalized === 'rejected') return 'Closed';
  if (normalized === 'withdrawn') return 'Withdrawn';
  if (normalized === 'expired') return 'Expired';
  return CHAT_STAGES.find((step) => step.key === normalized)?.label ?? 'Matched';
}

function ReactionPicker({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <Modal
      transparent
      visible={controller.reactionPickerId !== null}
      animationType="fade"
      onRequestClose={() => controller.setReactionPickerId(null)}
    >
      <Pressable style={styles.reactionBackdrop} onPress={controller.closeReactionPicker}>
        <Pressable style={styles.reactionPicker} onPress={() => undefined}>
          {REACTION_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => controller.toggleReaction(emoji)}
              style={({ pressed }) => [styles.reactionBtn, pressed && styles.reactionBtnPressed]}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
