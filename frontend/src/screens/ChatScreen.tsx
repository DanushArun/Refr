import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../components/common/Avatar';
import { PipelineStepper, type PipelineStage } from '../components/activity/PipelineStepper';
import { chatApi, referralsApi, type ChatMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

type Message = ChatMessage;
type DeliveryState = 'sending' | 'sent' | 'delivered' | 'read';

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '🙏', '🎉'];

/**
 * ChatScreen — WhatsApp / Instagram-class conversation surface, tuned for
 * referral context. Instant feel + rich feedback + stage-aware action.
 *
 * UX pillars (research: Bumble, Hinge, WhatsApp, iMessage, Intercom, Paradox):
 *   1. Anchored header — who + target role + company + pipeline + action
 *   2. Instant optimistic sends with delivery ticks (sending → sent → delivered → read)
 *   3. Typing indicator — animated three dots when counterpart composes
 *   4. Long-press reactions — emoji picker, reactions on bubble corner
 *   5. Quick replies — stage-contextual chips above the keyboard
 *   6. Grouped bubbles with tail radius, timestamp per group only
 *   7. Inline system messages for stage transitions
 */
export function ChatScreen() {
  const params = useLocalSearchParams();
  const referralId = params.referralId as string;
  const participantName = (params.participantName as string) ?? 'Match';
  const participantAvatar = params.participantAvatar as string | undefined;
  const targetRole = params.targetRole as string | undefined;
  const companyName = (params.companyName as string) ?? 'Razorpay';
  const initialStage = (params.stage as string | undefined) ?? 'matched';
  const [stage, setStage] = useState<PipelineStage>(initialStage as PipelineStage);
  const [stagePending, setStagePending] = useState(false);

  const { user } = useAuth();
  const viewerRole: 'endorser' | 'seeker' = user?.role === 'seeker' ? 'seeker' : 'endorser';

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  /** Per-message delivery state for the viewer's own sends. */
  const [deliveryStates, setDeliveryStates] = useState<Record<string, DeliveryState>>({});
  /** Per-message reactions — array of emoji strings. */
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  /** Is the counterpart "typing" right now? (demo-simulated) */
  const [typing, setTyping] = useState(false);
  /** Which message, if any, has its reaction picker open (by messageId) */
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);

  const listRef = useRef<FlatList<GroupedMessage>>(null);
  const simulatedReplyFired = useRef(false);

  /* ─── Load conversation ─── */
  useEffect(() => {
    chatApi.getConversation(referralId)
      .then((conv) => {
        setConversationId(conv.id);
        setMessages(conv.messages ?? []);
        // Pre-existing messages from counterpart count as read
        const d: Record<string, DeliveryState> = {};
        for (const m of conv.messages ?? []) {
          if (m.sender.id === (user?.id ?? '')) d[m.id] = 'read';
        }
        setDeliveryStates(d);
      })
      .catch(() => Alert.alert('Error', 'Failed to load conversation'))
      .finally(() => setLoading(false));
  }, [referralId, user?.id]);

  useEffect(() => {
    if (!conversationId) return;
    const sub = chatApi.subscribeToMessages(referralId, (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.unsubscribe();
  }, [conversationId, referralId]);

  /* ─── Scroll to bottom on new message ─── */
  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length, typing]);

  /* ─── Send a message — optimistic + delivery ticks ─── */
  const handleSend = useCallback(async (overrideBody?: string) => {
    const body = (overrideBody ?? draft).trim();
    if (!body || !conversationId || sending) return;

    setSending(true);
    setDraft('');

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      body,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id ?? '',
        displayName: user?.displayName ?? '',
        avatarUrl: user?.avatarUrl,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    setDeliveryStates((prev) => ({ ...prev, [tempId]: 'sending' }));

    try {
      const sent = (await chatApi.sendMessage(conversationId, body)) as Message;
      // Replace optimistic with confirmed, migrating delivery state key
      setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
      setDeliveryStates((prev) => {
        const { [tempId]: _, ...rest } = prev;
        return { ...rest, [sent.id]: 'sent' };
      });
      // Simulate delivery + read over time (feels alive in demo)
      setTimeout(() => setDeliveryStates((p) => ({ ...p, [sent.id]: 'delivered' })), 700);
      setTimeout(() => setDeliveryStates((p) => ({ ...p, [sent.id]: 'read' })), 1800);

      // Trigger one simulated counterpart reply per chat session for demo drama
      if (!simulatedReplyFired.current) {
        simulatedReplyFired.current = true;
        scheduleSimulatedReply({
          setTyping,
          setMessages,
          counterpartName: participantName,
          stage,
        });
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(body);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [draft, conversationId, sending, user, participantName, stage]);

  /* ─── Reactions ─── */
  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[messageId] ?? [];
      const next = current.includes(emoji)
        ? current.filter((e) => e !== emoji)
        : [...current, emoji].slice(-3); // cap at 3 per message
      return { ...prev, [messageId]: next };
    });
    Haptics.selectionAsync().catch(() => {});
    setReactionPickerId(null);
  }, []);

  /* ─── Stage transitions from chat ─── */
  const headerAction = useMemo(() => {
    if (viewerRole === 'seeker') return null;
    switch (stage) {
      case 'matched':
      case 'accepted':
      case 'requested':
        return { label: 'Submit to HR', next: 'submitted' as PipelineStage, msg: `${participantName} submitted to HR.` };
      case 'submitted':
        return { label: 'Mark interviewing', next: 'interviewing' as PipelineStage, msg: `${participantName} now interviewing.` };
      case 'interviewing':
        return { label: 'Record outcome', next: null as unknown as PipelineStage, msg: '' };
      default:
        return null;
    }
  }, [stage, viewerRole, participantName]);

  const handleHeaderAction = useCallback(() => {
    if (!headerAction) return;
    if (stage === 'interviewing') {
      Alert.alert('Record outcome', `Outcome for ${participantName}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rejected',
          style: 'destructive',
          onPress: async () => {
            setStagePending(true);
            await referralsApi.transition(referralId, 'rejected').catch(() => {});
            setStage('rejected');
            setStagePending(false);
            appendSystemMessage(setMessages, 'Marked as rejected');
          },
        },
        {
          text: 'Hired +10',
          onPress: async () => {
            setStagePending(true);
            await referralsApi.transition(referralId, 'hired').catch(() => {});
            setStage('hired');
            setStagePending(false);
            appendSystemMessage(setMessages, `Hired! ${participantName} joined ${companyName}. Endorsement +10.`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          },
        },
      ]);
      return;
    }

    Alert.alert(`${headerAction.label}?`, 'This advances the referral and notifies the seeker.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setStagePending(true);
          const next = headerAction.next;
          await referralsApi.transition(referralId, next).catch(() => {});
          setStage(next);
          setStagePending(false);
          appendSystemMessage(setMessages, headerAction.msg);
        },
      },
    ]);
  }, [headerAction, stage, referralId, participantName, companyName]);

  /* ─── Quick reply chips — stage-aware, viewer-aware ─── */
  const quickReplies = useMemo(
    () => quickRepliesFor(stage, viewerRole),
    [stage, viewerRole],
  );

  /* ─── Group messages ─── */
  const grouped = useMemo(() => groupMessages(messages), [messages]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={{ position: 'relative' }}>
          <Avatar displayName={participantName} uri={participantAvatar} size="md" />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.headerName} numberOfLines={1}>{participantName}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {typing ? (
              <Text style={{ color: colors.accent }}>typing…</Text>
            ) : (
              <>Online · {targetRole ? `${targetRole} · ${companyName}` : companyName}</>
            )}
          </Text>
        </View>
      </View>

      {/* Context banner */}
      <View style={styles.contextBanner}>
        <View style={{ flex: 1 }}>
          <PipelineStepper stage={stage} compact />
        </View>
        {headerAction && (
          <Pressable
            onPress={handleHeaderAction}
            disabled={stagePending}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.85 },
              stagePending && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.actionBtnText}>
              {stagePending ? 'Updating…' : headerAction.label}
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#ffffff" />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={grouped}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <MessageGroup
              group={item}
              viewerId={user?.id ?? ''}
              deliveryStates={deliveryStates}
              reactions={reactions}
              onLongPress={(msgId) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setReactionPickerId(msgId);
              }}
            />
          )}
          ListFooterComponent={typing ? <TypingBubble /> : null}
        />

        {/* Quick reply chips (only visible when draft is empty) */}
        {draft.length === 0 && quickReplies.length > 0 && (
          <View style={styles.quickRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
              {quickReplies.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => handleSend(q)}
                  style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.quickChipText}>{q}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={4000}
            />
          </View>
          <Pressable
            onPress={() => handleSend()}
            disabled={!draft.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Reaction picker modal — centered, tap outside to dismiss */}
      <Modal
        transparent
        visible={reactionPickerId !== null}
        animationType="fade"
        onRequestClose={() => setReactionPickerId(null)}
      >
        <Pressable style={styles.reactionBackdrop} onPress={() => setReactionPickerId(null)}>
          <Pressable style={styles.reactionPicker} onPress={() => {}}>
            {REACTION_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => reactionPickerId && toggleReaction(reactionPickerId, emoji)}
                style={({ pressed }) => [styles.reactionBtn, pressed && styles.reactionBtnPressed]}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── helpers ───────────────────────────────────────────────── */

interface GroupedMessage {
  id: string;
  senderId: string;
  senderName: string;
  bodies: { id: string; body: string }[];   // keep per-bubble IDs for reactions/delivery
  startedAt: string;
  endedAt: string;
  isSystem?: boolean;
}

const SYSTEM_SENDER_ID = '__endorsly_system__';

function groupMessages(messages: Message[]): GroupedMessage[] {
  const groups: GroupedMessage[] = [];
  for (const m of messages) {
    const isSystem = m.sender.id === SYSTEM_SENDER_ID;
    const last = groups[groups.length - 1];
    const withinWindow = last
      ? new Date(m.createdAt).getTime() - new Date(last.endedAt).getTime() < 5 * 60_000
      : false;
    if (last && !isSystem && !last.isSystem && last.senderId === m.sender.id && withinWindow) {
      last.bodies.push({ id: m.id, body: m.body });
      last.endedAt = m.createdAt;
    } else {
      groups.push({
        id: m.id,
        senderId: m.sender.id,
        senderName: m.sender.displayName,
        bodies: [{ id: m.id, body: m.body }],
        startedAt: m.createdAt,
        endedAt: m.createdAt,
        isSystem,
      });
    }
  }
  return groups;
}

function appendSystemMessage(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  body: string,
) {
  setMessages((prev) => [
    ...prev,
    {
      id: `sys-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      sender: { id: SYSTEM_SENDER_ID, displayName: 'Endorsly' },
    },
  ]);
}

function scheduleSimulatedReply(args: {
  setTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  counterpartName: string;
  stage: PipelineStage;
}) {
  const { setTyping, setMessages, counterpartName, stage } = args;
  const firstName = counterpartName.split(' ')[0];
  const reply = pickReplyForStage(stage, firstName);
  setTimeout(() => setTyping(true), 700);
  setTimeout(() => {
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `auto-${Date.now()}`,
        body: reply,
        createdAt: new Date().toISOString(),
        sender: { id: 'counterpart', displayName: counterpartName },
      },
    ]);
  }, 2400);
}

function pickReplyForStage(stage: PipelineStage, firstName: string): string {
  const opts: Record<string, string[]> = {
    matched: [
      'Great, just opened your profile. Looks strong.',
      `Thanks for reaching out — let me look at this properly today.`,
      'Strong background. What timezone are you in for a quick chat?',
    ],
    accepted: [
      'Looks like a solid fit. Share your target role again?',
      `Great background. When can we hop on a quick call?`,
    ],
    submitted: [
      'Just submitted. Recruiter usually reaches out in 2-3 business days.',
      'Submitted to HR. Expect to hear back mid-next-week.',
    ],
    interviewing: [
      'Heard the first round went well — keep the energy.',
      `Focus on distributed patterns for round 2 — that's their favourite area.`,
    ],
    hired: [
      `Congrats ${firstName}! Really happy this worked out.`,
    ],
    requested: [
      'Looking at your profile now.',
    ],
    rejected: ['Sorry about this round. More cards on the way.'],
    withdrawn: ['All good — reach out when you want to restart.'],
    expired: ['Timed out. Let me know if you want to re-match.'],
  };
  const list = opts[stage as string] ?? opts.matched;
  return list[Math.floor(Math.random() * list.length)];
}

function quickRepliesFor(stage: PipelineStage, role: 'endorser' | 'seeker'): string[] {
  if (role === 'seeker') {
    switch (stage) {
      case 'matched':
      case 'accepted':
      case 'requested':
        return ['Thanks for endorsing!', 'Happy to share more about my background.', 'What info do you need?'];
      case 'submitted':
        return ['Thanks so much!', 'Any interview tips?', 'When should I expect to hear back?'];
      case 'interviewing':
        return ['Cleared round 1!', 'Any advice for the next round?', 'Feeling good about the loop.'];
      default:
        return [];
    }
  }
  switch (stage) {
    case 'matched':
    case 'accepted':
    case 'requested':
      return ['Share your resume link?', 'What role are you targeting?', 'Free for a 15-min call this week?'];
    case 'submitted':
      return ['Submitted — recruiter will reach out soon.', 'Prep tip: focus on system design.'];
    case 'interviewing':
      return ['How did it go?', 'Any blockers I can help with?'];
    default:
      return [];
  }
}

function formatGroupTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ─── subcomponents ─────────────────────────────────────────── */

function MessageGroup({
  group,
  viewerId,
  deliveryStates,
  reactions,
  onLongPress,
}: {
  group: GroupedMessage;
  viewerId: string;
  deliveryStates: Record<string, DeliveryState>;
  reactions: Record<string, string[]>;
  onLongPress: (messageId: string) => void;
}) {
  const mine = group.senderId === viewerId;

  if (group.isSystem) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemPill}>
          <Text style={styles.systemText}>{group.bodies[0].body}</Text>
        </View>
      </View>
    );
  }

  const lastBubbleId = group.bodies[group.bodies.length - 1].id;
  const lastDelivery = deliveryStates[lastBubbleId];

  return (
    <View style={[styles.groupWrap, mine ? styles.groupMine : styles.groupTheirs]}>
      {group.bodies.map((b, i) => {
        const isFirst = i === 0;
        const isLast = i === group.bodies.length - 1;
        const reactionList = reactions[b.id] ?? [];
        return (
          <View key={b.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
            <Pressable
              onLongPress={() => onLongPress(b.id)}
              delayLongPress={300}
              style={[
                styles.bubble,
                mine ? styles.bubbleMine : styles.bubbleTheirs,
                mine
                  ? isFirst
                    ? styles.bubbleMineFirst
                    : isLast
                    ? styles.bubbleMineLast
                    : styles.bubbleMineMiddle
                  : isFirst
                  ? styles.bubbleTheirsFirst
                  : isLast
                  ? styles.bubbleTheirsLast
                  : styles.bubbleTheirsMiddle,
                i > 0 && { marginTop: 2 },
              ]}
            >
              <Text style={[styles.bubbleText, mine ? styles.textMine : styles.textTheirs]}>
                {b.body}
              </Text>
            </Pressable>
            {reactionList.length > 0 && (
              <View style={[styles.reactionRow, mine ? { marginRight: 12 } : { marginLeft: 12 }]}>
                {reactionList.map((emoji, idx) => (
                  <Text key={`${emoji}-${idx}`} style={styles.reactionBadgeText}>{emoji}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <View style={[styles.groupMeta, mine && styles.groupMetaMine]}>
        <Text style={styles.groupTime}>{formatGroupTime(group.endedAt)}</Text>
        {mine && <DeliveryTicks state={lastDelivery} />}
      </View>
    </View>
  );
}

function DeliveryTicks({ state }: { state?: DeliveryState }) {
  if (!state) return null;
  if (state === 'sending') {
    return <Ionicons name="time-outline" size={11} color={colors.textTertiary} style={{ marginLeft: 4 }} />;
  }
  if (state === 'sent') {
    return <Ionicons name="checkmark" size={13} color={colors.textTertiary} style={{ marginLeft: 4 }} />;
  }
  const color = state === 'read' ? '#4da6ff' : colors.textTertiary;
  return (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
      <Ionicons name="checkmark-done" size={13} color={color} />
    </View>
  );
}

function TypingBubble() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycle = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true, delay }),
          Animated.timing(v, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    cycle(dot1, 0);
    cycle(dot2, 150);
    cycle(dot3, 300);
  }, [dot1, dot2, dot3]);

  const style = (v: Animated.Value) => ({
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
  });

  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, style(dot1)]} />
        <Animated.View style={[styles.typingDot, style(dot2)]} />
        <Animated.View style={[styles.typingDot, style(dot3)]} />
      </View>
    </View>
  );
}

/* ─── styles ───────────────────────────────────────────────── */

const RADIUS_LG = 20;
const RADIUS_SM = 6;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kav: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -spacing[2],
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerMeta: { flex: 1, gap: 2 },
  headerName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerSub: { ...typography.caption, color: colors.textSecondary },

  /* Context banner */
  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing[3],
    backgroundColor: 'rgba(124,58,237,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  actionBtnText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },

  /* Message list */
  messageList: {
    padding: layout.screenPaddingH,
    paddingTop: spacing[4],
    gap: spacing[4],
  },

  /* Groups */
  groupWrap: { maxWidth: '82%' },
  groupMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  groupTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    paddingHorizontal: spacing[1],
  },
  groupMetaMine: { alignSelf: 'flex-end' },
  groupTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: colors.textTertiary,
  },

  /* Bubbles */
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS_LG,
  },
  bubbleText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  textMine: { color: '#ffffff' },
  textTheirs: { color: colors.text },

  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: RADIUS_SM },
  bubbleMineFirst: { borderBottomRightRadius: RADIUS_SM },
  bubbleMineMiddle: { borderTopRightRadius: RADIUS_SM, borderBottomRightRadius: RADIUS_SM },
  bubbleMineLast: { borderTopRightRadius: RADIUS_SM, borderBottomRightRadius: RADIUS_SM },

  bubbleTheirs: { backgroundColor: colors.surfaceLevel2, borderBottomLeftRadius: RADIUS_SM },
  bubbleTheirsFirst: { borderBottomLeftRadius: RADIUS_SM },
  bubbleTheirsMiddle: { borderTopLeftRadius: RADIUS_SM, borderBottomLeftRadius: RADIUS_SM },
  bubbleTheirsLast: { borderTopLeftRadius: RADIUS_SM, borderBottomLeftRadius: RADIUS_SM },

  /* Reactions on bubble */
  reactionRow: {
    marginTop: -8,
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionBadgeText: { fontSize: 12, marginHorizontal: 1 },

  /* Reaction picker */
  reactionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 999,
    padding: spacing[2],
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionBtnPressed: { backgroundColor: colors.surfaceHover },
  reactionEmoji: { fontSize: 24 },

  /* System message */
  systemRow: { alignItems: 'center', marginVertical: spacing[2] },
  systemPill: {
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1.5],
  },
  systemText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  /* Typing */
  typingRow: { alignItems: 'flex-start', marginTop: spacing[2] },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLevel2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS_LG,
    borderBottomLeftRadius: RADIUS_SM,
  },
  typingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },

  /* Quick replies */
  quickRow: {
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  quickScroll: { paddingHorizontal: layout.screenPaddingH, gap: spacing[2] },
  quickChip: {
    backgroundColor: colors.surfaceLevel1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 999,
    marginRight: spacing[2],
  },
  quickChipText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    color: colors.text,
  },

  /* Input */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: Platform.OS === 'ios' ? spacing[3] : spacing[3],
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceLevel1,
    borderRadius: 22,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    maxHeight: 120,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.accentDim },
});
