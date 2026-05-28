import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

import { PipelineStepper } from '../components/activity/PipelineStepper';
import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { colors } from '../theme/colors';
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
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </SafeAreaView>
  );
}

function ChatView({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader controller={controller} />
      <ContextBanner controller={controller} />
      <ChatBody controller={controller} />
      <ReactionPicker controller={controller} />
    </SafeAreaView>
  );
}

function ChatHeader({ controller }: { controller: ChatController }): React.ReactElement {
  const sub = controller.targetRole
    ? `${controller.targetRole} · ${controller.companyName}`
    : controller.companyName;

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </Pressable>
      <Avatar
        displayName={controller.participantName}
        uri={controller.participantAvatar}
        size="md"
      />
      <View style={styles.headerMeta}>
        <Text style={styles.headerName} numberOfLines={1}>{controller.participantName}</Text>
        <Text style={styles.headerSub} numberOfLines={1}>
          {controller.typing ? <Text style={styles.typingInline}>typing...</Text> : sub}
        </Text>
      </View>
    </View>
  );
}

function ContextBanner({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <View style={styles.contextBanner}>
      <View style={styles.contextStepper}>
        <PipelineStepper stage={controller.stage} compact />
      </View>
      {controller.headerAction && (
        <HeaderActionButton
          action={controller.headerAction}
          pending={controller.stagePending}
          onPress={controller.handleHeaderAction}
        />
      )}
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
        pressed && { opacity: 0.85 },
        pending && { opacity: 0.5 },
      ]}
    >
      <Text style={styles.actionBtnText}>{pending ? 'Updating...' : action.label}</Text>
      <Ionicons name="arrow-forward" size={14} color={colors.background} />
    </Pressable>
  );
}

function ChatBody({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.kav}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <MessageList
        groups={controller.grouped}
        viewerId={controller.viewerId}
        deliveryStates={controller.deliveryStates}
        reactions={controller.reactions}
        typing={controller.typing}
        onLongPress={controller.openReactionPicker}
      />
      <QuickReplies controller={controller} />
      <Composer controller={controller} />
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
          pressed && { opacity: 0.85 },
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
