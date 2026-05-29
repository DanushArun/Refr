import React from 'react';

import type { PipelineStage } from '../../components/activity/PipelineStepper';
import type { ChatMessage } from '../../services/api';

export type Message = ChatMessage;
export type DeliveryState = 'sending' | 'sent' | 'delivered' | 'read';
export type ViewerRole = 'endorser' | 'seeker';

export interface GroupedMessage {
  id: string;
  senderId: string;
  senderName: string;
  bodies: { id: string; body: string }[];
  startedAt: string;
  endedAt: string;
  isSystem?: boolean;
}

export const SYSTEM_SENDER_ID = '__endorsly_system__';
export const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '🙏', '🎉'];

let chatUidCounter = 0;

export function chatUid(prefix: string): string {
  chatUidCounter += 1;
  return `${prefix}-${Date.now()}-${chatUidCounter}`;
}

export function groupMessages(messages: Message[]): GroupedMessage[] {
  const groups: GroupedMessage[] = [];

  for (const message of messages) {
    const isSystem = message.sender.id === SYSTEM_SENDER_ID;
    const last = groups[groups.length - 1];
    const withinWindow = isWithinGroupWindow(message, last);

    if (last && canJoinGroup(message, last, isSystem, withinWindow)) {
      last.bodies.push({ id: message.id, body: message.body });
      last.endedAt = message.createdAt;
      continue;
    }

    groups.push(createGroup(message, isSystem));
  }

  return groups;
}

export function appendSystemMessage(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  body: string,
): void {
  setMessages((prev) => [...prev, buildSystemMessage(body)]);
}

export function buildSystemMessage(body: string): Message {
  return {
    id: chatUid('sys'),
    body,
    createdAt: new Date().toISOString(),
    sender: { id: SYSTEM_SENDER_ID, displayName: 'Endorsly' },
  };
}

export function pickReplyForStage(stage: PipelineStage, firstName: string): string {
  const replies = replyOptions(firstName);
  const list = replies[stage] ?? replies.matched;
  return list[Math.floor(Math.random() * list.length)];
}

export function quickRepliesFor(stage: PipelineStage, role: ViewerRole): string[] {
  if (role === 'seeker') return seekerQuickReplies(stage);
  return endorserQuickReplies(stage);
}

export function formatGroupTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    return `Yesterday ${time}`;
  }

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function isWithinGroupWindow(message: Message, last?: GroupedMessage): boolean {
  if (!last) return false;
  const delta = new Date(message.createdAt).getTime() - new Date(last.endedAt).getTime();
  return delta < 5 * 60_000;
}

function canJoinGroup(
  message: Message,
  last: GroupedMessage,
  isSystem: boolean,
  withinWindow: boolean,
): boolean {
  return !isSystem && !last.isSystem && last.senderId === message.sender.id && withinWindow;
}

function createGroup(message: Message, isSystem: boolean): GroupedMessage {
  return {
    id: message.id,
    senderId: message.sender.id,
    senderName: message.sender.displayName,
    bodies: [{ id: message.id, body: message.body }],
    startedAt: message.createdAt,
    endedAt: message.createdAt,
    isSystem,
  };
}

function seekerQuickReplies(stage: PipelineStage): string[] {
  switch (stage) {
    case 'matched':
    case 'accepted':
    case 'requested':
      return [
        'Thanks for endorsing!',
        'Happy to share more about my background.',
        'What info do you need?',
      ];
    case 'submitted':
      return ['Thanks so much!', 'Any interview tips?', 'When should I expect to hear back?'];
    case 'interviewing':
      return ['Cleared round 1!', 'Any advice for the next round?', 'Feeling good about the loop.'];
    default:
      return [];
  }
}

function endorserQuickReplies(stage: PipelineStage): string[] {
  switch (stage) {
    case 'matched':
    case 'accepted':
    case 'requested':
      return [
        'Share your resume link?',
        'What role are you targeting?',
        'Free for a 15-min call this week?',
      ];
    case 'submitted':
      return ['Submitted - recruiter will reach out soon.', 'Prep tip: focus on system design.'];
    case 'interviewing':
      return ['How did it go?', 'Any blockers I can help with?'];
    default:
      return [];
  }
}

function replyOptions(firstName: string): Record<PipelineStage, string[]> {
  return {
    matched: [
      'Great, just opened your profile. Looks strong.',
      'Thanks for reaching out. Let me look at this properly today.',
      'Strong background. What timezone are you in for a quick chat?',
    ],
    accepted: [
      'Looks like a solid fit. Share your target role again?',
      'Great background. When can we hop on a quick call?',
    ],
    requested: ['Looking at your profile now.'],
    submitted: [
      'Just submitted. Recruiter usually reaches out in 2-3 business days.',
      'Submitted to HR. Expect to hear back mid-next-week.',
    ],
    interviewing: [
      'Heard the first round went well - keep the energy.',
      "Focus on distributed patterns for round 2 - that's their favourite area.",
    ],
    hired: [`Congrats ${firstName}! Really happy this worked out.`],
    rejected: ['Sorry about this round. More cards on the way.'],
    withdrawn: ['All good - reach out when you want to restart.'],
    expired: ['Timed out. Let me know if you want to re-match.'],
  };
}
