import React from 'react';
import { Alert } from 'react-native';

import type { PipelineStage } from '../../components/activity/PipelineStepper';
import { Phrase, playSensoryEvent } from '../../utils/haptics';
import { chatApi, referralsApi } from '../../services/api';
import {
  DeliveryState,
  Message,
  ViewerRole,
  appendSystemMessage,
  chatUid,
  pickReplyForStage,
} from './chatLogic';
import type { HeaderAction } from './useChatController';

export function readStatesFor(
  messages: Message[],
  userId: string,
): Record<string, DeliveryState> {
  const states: Record<string, DeliveryState> = {};
  for (const message of messages) {
    if (message.sender.id === userId) states[message.id] = 'read';
  }
  return states;
}

export function actionFor(
  stage: PipelineStage,
  role: ViewerRole,
  participantName: string,
): HeaderAction | null {
  if (role === 'seeker') return null;
  if (stage === 'submitted') {
    return transitionAction('Mark interviewing', 'interviewing', participantName);
  }
  if (stage === 'interviewing') return { label: 'Record outcome', next: null, msg: '' };
  if (stage === 'matched' || stage === 'accepted' || stage === 'requested') {
    return transitionAction('Submit to HR', 'submitted', participantName);
  }
  return null;
}

export async function sendWithOptimism(args: {
  body: string;
  conversationId: string | null;
  participantName: string;
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
  setDraft: (draft: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSending: (sending: boolean) => void;
  setTyping: (typing: boolean) => void;
  simulatedReplyFired: React.MutableRefObject<boolean>;
  stage: PipelineStage;
  temp: Message;
}): Promise<void> {
  try {
    const sent = await chatApi.sendMessage(args.conversationId!, args.body);
    replaceOptimistic(args, sent as Message);
    maybeScheduleReply(args);
    void Phrase.messageSent();
  } catch (err) {
    failSend(args, err);
  } finally {
    args.setSending(false);
  }
}

export function confirmOutcome(args: {
  companyName: string;
  participantName: string;
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
}): void {
  Alert.alert('Record outcome', `Outcome for ${args.participantName}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Rejected', style: 'destructive', onPress: () => transitionRejected(args) },
    { text: 'Hired +10', onPress: () => transitionHired(args) },
  ]);
}

export function confirmStageAdvance(args: {
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
}, action: HeaderAction): void {
  Alert.alert(`${action.label}?`, 'This advances the Endorsement and notifies the seeker.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', onPress: () => transitionStage(args, action) },
  ]);
}

export function optimisticMessage(
  body: string,
  user?: { id?: string; displayName?: string; avatarUrl?: string | null } | null,
): Message {
  return {
    id: chatUid('temp'),
    body,
    createdAt: new Date().toISOString(),
    sender: {
      id: user?.id ?? '',
      displayName: user?.displayName ?? '',
      avatarUrl: user?.avatarUrl ?? undefined,
    },
  };
}

export function appendIfMissing(messages: Message[], next: Message): Message[] {
  if (messages.some((message) => message.id === next.id)) return messages;
  return [...messages, next];
}

export function toggleEmoji(
  all: Record<string, string[]>,
  messageId: string,
  emoji: string,
): Record<string, string[]> {
  const current = all[messageId] ?? [];
  const next = current.includes(emoji)
    ? current.filter((entry) => entry !== emoji)
    : [...current, emoji].slice(-3);
  return { ...all, [messageId]: next };
}

function transitionAction(
  label: string,
  next: PipelineStage,
  participantName: string,
): HeaderAction {
  const msg = next === 'submitted'
    ? `${participantName} submitted to HR.`
    : `${participantName} now interviewing.`;
  return { label, next, msg };
}

function replaceOptimistic(args: {
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  temp: Message;
}, sent: Message): void {
  args.setMessages((prev) => replaceMessage(prev, args.temp.id, sent));
  args.setDeliveryStates((prev) => replaceDeliveryKey(prev, args.temp.id, sent.id));
  setTimeout(() => markDelivered(args, sent.id), 700);
  setTimeout(() => markRead(args, sent.id), 1800);
}

function maybeScheduleReply(args: {
  participantName: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTyping: (typing: boolean) => void;
  simulatedReplyFired: React.MutableRefObject<boolean>;
  stage: PipelineStage;
}): void {
  if (args.simulatedReplyFired.current) return;
  args.simulatedReplyFired.current = true;
  scheduleSimulatedReply(args);
}

function scheduleSimulatedReply(args: {
  participantName: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTyping: (typing: boolean) => void;
  stage: PipelineStage;
}): void {
  const firstName = args.participantName.split(' ')[0];
  const reply = pickReplyForStage(args.stage, firstName);
  setTimeout(() => args.setTyping(true), 700);
  setTimeout(() => appendAutoReply(args, reply), 2400);
}

function appendAutoReply(args: {
  participantName: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTyping: (typing: boolean) => void;
}, reply: string): void {
  args.setTyping(false);
  args.setMessages((prev) => [...prev, autoReply(args.participantName, reply)]);
}

function failSend(args: {
  body: string;
  setDraft: (draft: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  temp: Message;
}, err: unknown): void {
  args.setMessages((prev) => prev.filter((message) => message.id !== args.temp.id));
  args.setDraft(args.body);
  void playSensoryEvent('failure.rollback');
  Alert.alert('Message not sent', errorText(err, 'Your draft is still here. Please try again.'));
}

function transitionRejected(args: {
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
}): void {
  transitionStage(args, { label: 'Rejected', next: 'rejected', msg: 'Marked as rejected' });
}

function transitionHired(args: {
  companyName: string;
  participantName: string;
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
}): void {
  const msg = `Hired! ${args.participantName} joined ${args.companyName}. Endorsement +10.`;
  transitionStage(args, { label: 'Hired', next: 'hired', msg });
}

async function transitionStage(args: {
  referralId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
}, action: HeaderAction): Promise<void> {
  if (!action.next) return;
  args.setStagePending(true);
  try {
    await referralsApi.transition(args.referralId, action.next);
    args.setStage(action.next);
    appendSystemMessage(args.setMessages, action.msg);
    void playSensoryEvent(action.next === 'hired' ? 'hire.confirmed' : 'pipeline.advance');
  } catch (err) {
    void playSensoryEvent('failure.rollback');
    Alert.alert('Could not update', errorText(err, 'Please try again.'));
  } finally {
    args.setStagePending(false);
  }
}

function autoReply(participantName: string, body: string): Message {
  return {
    id: chatUid('auto'),
    body,
    createdAt: new Date().toISOString(),
    sender: { id: 'counterpart', displayName: participantName },
  };
}

function replaceMessage(messages: Message[], tempId: string, sent: Message): Message[] {
  return messages.map((message) => (message.id === tempId ? sent : message));
}

function replaceDeliveryKey(
  states: Record<string, DeliveryState>,
  tempId: string,
  sentId: string,
): Record<string, DeliveryState> {
  const { [tempId]: _discard, ...rest } = states;
  return { ...rest, [sentId]: 'sent' };
}

function markDelivered(args: {
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
}, id: string): void {
  args.setDeliveryStates((prev) => ({ ...prev, [id]: 'delivered' }));
}

function markRead(args: {
  setDeliveryStates: React.Dispatch<React.SetStateAction<Record<string, DeliveryState>>>;
}, id: string): void {
  args.setDeliveryStates((prev) => ({ ...prev, [id]: 'read' }));
}

function errorText(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
