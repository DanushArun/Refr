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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '../components/common/Avatar';
import { PressableScale } from '../components/common/PressableScale';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { navigateAfterPress } from '../utils/navigationAfterPress';
import { useChatController, type ChatController } from './chat/useChatController';
import { MessageList } from './chat/ChatMessages';
import { chatStyles as styles } from './chat/chatStyles';
import { REACTION_EMOJIS } from './chat/chatLogic';

export function ChatScreen(): React.ReactElement {
  const controller = useChatController();

  return <ChatView controller={controller} />;
}

function ChatView({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader controller={controller} />
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
      <PressableScale
        onPress={() => navigateAfterPress(() => router.back())}
        hitSlop={12}
        pressedScale={0.92}
        pressedOpacity={0.7}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </PressableScale>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Open ${controller.participantName} contact info`}
        onPress={() => openChatProfile(controller)}
        pressedScale={0.985}
        pressedOpacity={0.78}
        style={styles.headerProfile}
      >
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
      </PressableScale>
    </View>
  );
}

function openChatProfile(controller: ChatController): void {
  navigateAfterPress(() => {
    router.push({
      pathname: '/chat-profile',
      params: {
        companyName: controller.companyName,
        participantAvatar: controller.participantAvatar ?? '',
        participantName: controller.participantName,
        participantSubtitle: controller.participantSubtitle ?? '',
        referralId: controller.referralId,
        stage: controller.stage,
        targetRole: controller.targetRole ?? '',
      },
    });
  });
}

function ChatBody({ controller }: { controller: ChatController }): React.ReactElement {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.kav}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.chatPanel}>
        <View style={styles.messageViewport}>
          <MessageList
            groups={controller.grouped}
            loading={controller.loading}
            viewerId={controller.viewerId}
            deliveryStates={controller.deliveryStates}
            reactions={controller.reactions}
            typing={controller.typing}
            onLongPress={controller.openReactionPicker}
          />
        </View>
        <View style={styles.composerDock}>
          <QuickReplies controller={controller} />
          <Composer controller={controller} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function QuickReplies({ controller }: { controller: ChatController }): React.ReactElement | null {
  if (controller.loading || controller.draft.length > 0 || controller.quickReplies.length === 0) {
    return null;
  }

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
  const insets = useSafeAreaInsets();
  const disabled = controller.loading || !controller.draft.trim() || controller.sending;

  return (
    <View style={[styles.inputRow, { paddingBottom: composerBottomPadding(insets.bottom) }]}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={controller.draft}
          onChangeText={controller.setDraft}
          placeholder="Message"
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
          spellCheck={false}
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

function composerBottomPadding(bottomInset: number): number {
  if (Platform.OS !== 'ios') return spacing[3];
  return Math.max(spacing[2], bottomInset - spacing[4]);
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
