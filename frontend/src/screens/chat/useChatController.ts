import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import type { PipelineStage } from '../../components/activity/PipelineStepper';
import { playSensoryEvent } from '../../utils/haptics';
import { chatApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
  DeliveryState,
  GroupedMessage,
  Message,
  ViewerRole,
  groupMessages,
  quickRepliesFor,
} from './chatLogic';
import {
  actionFor,
  appendIfMissing,
  confirmOutcome,
  confirmStageAdvance,
  optimisticMessage,
  readStatesFor,
  sendWithOptimism,
  toggleEmoji,
} from './chatActions';
import { subscribeChatStage } from './chatStageEvents';

export interface HeaderAction {
  label: string;
  next: PipelineStage | null;
  msg: string;
}

export interface ChatController {
  companyName: string;
  deliveryStates: Record<string, DeliveryState>;
  draft: string;
  grouped: GroupedMessage[];
  handleHeaderAction: () => void;
  handleSend: (overrideBody?: string) => Promise<void>;
  headerAction: HeaderAction | null;
  loading: boolean;
  messages: Message[];
  openReactionPicker: (messageId: string) => void;
  participantAvatar?: string;
  participantName: string;
  participantSubtitle?: string;
  quickReplies: string[];
  referralId: string;
  reactionPickerId: string | null;
  reactions: Record<string, string[]>;
  sending: boolean;
  setDraft: (draft: string) => void;
  setReactionPickerId: (messageId: string | null) => void;
  closeReactionPicker: () => void;
  stage: PipelineStage;
  stagePending: boolean;
  targetRole?: string;
  toggleReaction: (emoji: string) => void;
  typing: boolean;
  viewerRole: ViewerRole;
  viewerId: string;
}

interface ChatParams {
  companyName: string;
  initialStage: PipelineStage;
  participantAvatar?: string;
  participantName: string;
  participantSubtitle?: string;
  referralId: string;
  targetRole?: string;
}

export function useChatController(): ChatController {
  const params = useChatParams();
  const { user } = useAuth();
  const viewerRole: ViewerRole = user?.role === 'seeker' ? 'seeker' : 'endorser';
  const [stage, setStage] = useState<PipelineStage>(params.initialStage);
  const [stagePending, setStagePending] = useState(false);
  useSyncedStage(params.referralId, setStage);
  const messageState = useMessageState(params.referralId, user?.id ?? '');
  const send = useSendMessage({ ...params, ...messageState, stage, user });
  const reactions = useReactionActions(messageState);
  const header = useHeaderAction({
    ...params,
    setMessages: messageState.setMessages,
    setStage,
    setStagePending,
    stage,
    viewerRole,
  });
  const quickReplies = useMemo(() => quickRepliesFor(stage, viewerRole), [stage, viewerRole]);
  const grouped = useMemo(() => groupMessages(messageState.messages), [messageState.messages]);

  return {
    ...params,
    ...messageState,
    ...reactions,
    ...send,
    ...header,
    grouped,
    quickReplies,
    stage,
    stagePending,
    viewerRole,
    viewerId: user?.id ?? '',
  };
}

function useChatParams(): ChatParams {
  const params = useLocalSearchParams();
  return {
    referralId: params.referralId as string,
    participantName: (params.participantName as string) ?? 'Match',
    participantAvatar: params.participantAvatar as string | undefined,
    participantSubtitle: params.participantSubtitle as string | undefined,
    targetRole: params.targetRole as string | undefined,
    companyName: (params.companyName as string | undefined) ?? 'Endorsly',
    initialStage: ((params.stage as string | undefined) ?? 'matched') as PipelineStage,
  };
}

function useSyncedStage(
  referralId: string,
  setStage: (stage: PipelineStage) => void,
): void {
  useEffect(() => subscribeChatStage(referralId, setStage), [referralId, setStage]);
}

function useMessageState(referralId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [deliveryStates, setDeliveryStates] = useState<Record<string, DeliveryState>>({});
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [typing, setTyping] = useState(false);
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);

  useConversationLoader({
    referralId,
    setConversationId,
    setDeliveryStates,
    setLoading,
    setMessages,
    userId,
  });
  useMessageSubscription({ conversationId, referralId, setMessages });

  return {
    conversationId,
    deliveryStates,
    draft,
    loading,
    messages,
    reactionPickerId,
    reactions,
    sending,
    setDeliveryStates,
    setDraft,
    setMessages,
    setReactionPickerId,
    setReactions,
    setSending,
    setTyping,
    typing,
  };
}

function useConversationLoader(args: {
  referralId: string;
  setConversationId: (id: string) => void;
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
  setLoading: (loading: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
}): void {
  useEffect(() => {
    chatApi.getConversation(args.referralId)
      .then((conv) => {
        args.setConversationId(conv.id);
        args.setMessages(conv.messages ?? []);
        args.setDeliveryStates(readStatesFor(conv.messages ?? [], args.userId));
      })
      .catch((err) => {
        Alert.alert('Conversation unavailable', errorText(err, 'Please reopen this chat.'));
      })
      .finally(() => args.setLoading(false));
  }, [args.referralId, args.userId]);
}

function useMessageSubscription(args: {
  conversationId: string | null;
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}): void {
  useEffect(() => {
    if (!args.conversationId) return undefined;
    const sub = chatApi.subscribeToMessages(args.referralId, (msg: Message) => {
      args.setMessages((prev) => appendIfMissing(prev, msg));
    });
    return () => sub.unsubscribe();
  }, [args.conversationId, args.referralId]);
}

function useSendMessage(args: {
  companyName: string;
  conversationId: string | null;
  draft: string;
  messages: Message[];
  participantName: string;
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
  setDraft: (draft: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSending: (sending: boolean) => void;
  setTyping: (typing: boolean) => void;
  sending: boolean;
  stage: PipelineStage;
  user?: { id?: string; displayName?: string; avatarUrl?: string | null } | null;
}) {
  const simulatedReplyFired = useRef(false);
  const handleSend = useCallback(async (overrideBody?: string) => {
    const body = (overrideBody ?? args.draft).trim();
    if (!body || !args.conversationId || args.sending) return;
    const temp = optimisticMessage(body, args.user);

    args.setSending(true);
    args.setDraft('');
    args.setMessages((prev) => [...prev, temp]);
    args.setDeliveryStates((prev) => ({ ...prev, [temp.id]: 'sending' }));

    await sendWithOptimism({ ...args, body, simulatedReplyFired, temp });
  }, [args]);

  return { handleSend };
}

function useHeaderAction(args: {
  companyName: string;
  participantName: string;
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
  stage: PipelineStage;
  viewerRole: ViewerRole;
}): { headerAction: HeaderAction | null; handleHeaderAction: () => void } {
  const headerAction = useMemo(
    () => actionFor(args.stage, args.viewerRole, args.participantName),
    [args],
  );
  const handleHeaderAction = useCallback(() => {
    if (!headerAction) return;
    if (args.stage === 'interviewing') {
      confirmOutcome(args);
      return;
    }
    confirmStageAdvance(args, headerAction);
  }, [args, headerAction]);

  return { headerAction, handleHeaderAction };
}

export function useReactionActions(args: {
  reactionPickerId: string | null;
  setReactionPickerId: (messageId: string | null) => void;
  setReactions: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}) {
  const openReactionPicker = useCallback((messageId: string) => {
    void playSensoryEvent('control.tap');
    args.setReactionPickerId(messageId);
  }, [args]);

  const toggleReaction = useCallback((emoji: string) => {
    if (!args.reactionPickerId) return;
    args.setReactions((prev) => toggleEmoji(prev, args.reactionPickerId!, emoji));
    void playSensoryEvent('control.select');
    args.setReactionPickerId(null);
  }, [args]);

  return {
    closeReactionPicker: () => args.setReactionPickerId(null),
    openReactionPicker,
    toggleReaction,
  };
}

function errorText(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
