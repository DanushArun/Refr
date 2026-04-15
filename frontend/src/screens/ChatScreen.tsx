import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { chatApi, type ChatMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type Message = ChatMessage;

/**
 * ChatScreen — real-time chat within a referral.
 *
 * Supabase Realtime provides WebSocket updates — new messages appear
 * without polling. The conversation is scoped to one referral.
 *
 * UI: WhatsApp-style bubble layout. Sent messages right-aligned (violet),
 * received left-aligned (glass surface).
 */
export function ChatScreen() {
  const params = useLocalSearchParams();
  const referralId = params.referralId as string;
  const participantName = params.participantName as string;
  
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    chatApi.getConversation(referralId)
      .then((conv) => {
        setConversationId(conv.id);
        setMessages(conv.messages || []);
        setLoading(false);
      })
      .catch(() => {
        setMessages([]);
        setLoading(false);
        Alert.alert('Error', 'Failed to load conversation');
      });
  }, [referralId, participantName]);

  // Poll for new messages using the referral ID (backend API key)
  useEffect(() => {
    if (!conversationId) return;
    const sub = chatApi.subscribeToMessages(referralId, (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.unsubscribe();
  }, [conversationId, referralId]);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !conversationId || sending) return;

    setSending(true);
    setDraft('');

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id ?? '',
        displayName: user?.displayName ?? '',
        avatarUrl: user?.avatarUrl,
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50,
    );

    try {
      const sent = await chatApi.sendMessage(conversationId, body) as Message;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sent : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticMsg.id),
      );
      setDraft(body);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [draft, conversationId, sending, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: participantName }} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: participantName }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMine = item.sender.id === user?.id;
            return (
              <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                    {item.body}
                  </Text>
                  <Text style={styles.bubbleTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={4000}
          />
          <Pressable
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  kav: { flex: 1 },
  messageList: {
    padding: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing[1] },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    gap: spacing[1],
  },
  bubbleMine: {
    backgroundColor: colors.chatBubbleSent,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.chatBubbleReceived,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...typography.body,
    lineHeight: 22,
  },
  bubbleTextMine: { color: colors.text },
  bubbleTextTheirs: { color: colors.text },
  bubbleTime: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing[3],
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 22,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    color: colors.text,
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.accentDim,
  },
  sendBtnText: {
    color: colors.text,
    fontSize: 20,
    fontFamily: 'Outfit-Bold',
  },
});
