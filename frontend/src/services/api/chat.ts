import {
  DEMO,
  appendChatMessage,
  chatForReferral,
  isDemoScreen,
} from '../../demo/config';
import { request } from './http';
import { uid } from './uid';

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; displayName: string; avatarUrl?: string };
}

function buildMockChatMessage(body: string): ChatMessage {
  const sender = DEMO.demoRole === 'seeker'
    ? { id: '1', displayName: 'Danush Arun' }
    : { id: '2', displayName: 'Nivrant Goswami' };
  return {
    id: uid('msg-demo'),
    body,
    createdAt: new Date().toISOString(),
    sender,
  };
}

function unreadMessages(messages: ChatMessage[], lastMessageId: string | null): ChatMessage[] {
  if (!lastMessageId) return messages.slice(-1);
  const lastIdx = messages.findIndex((m) => m.id === lastMessageId);
  return lastIdx >= 0 ? messages.slice(lastIdx + 1) : messages.slice(-1);
}

function pollForMessages(
  referralId: string,
  onMessage: (msg: ChatMessage) => void,
) {
  let lastMessageId: string | null = null;

  const poll = async () => {
    try {
      const data = await chatApi.getConversation(referralId);
      const messages = data.messages;
      if (messages.length === 0) return;
      unreadMessages(messages, lastMessageId).forEach((m) => onMessage(m));
      lastMessageId = messages[messages.length - 1].id;
    } catch (error: unknown) {
      if (__DEV__) console.warn('Chat polling failed', error);
    }
  };

  const interval = setInterval(poll, 3000);
  poll();
  return { unsubscribe: () => clearInterval(interval) };
}

export const chatApi = {
  getConversation: (
    referralId: string,
  ): Promise<{ id: string; messages: ChatMessage[] }> => {
    if (isDemoScreen('chat')) {
      return Promise.resolve({
        id: `conv-${referralId}`,
        messages: chatForReferral(referralId),
      });
    }
    return request<{
      data: { id: string; messages: ChatMessage[] };
    }>(`/api/v1/chat/${referralId}/`).then((r) => r.data);
  },

  sendMessage: (conversationId: string, body: string): Promise<ChatMessage> => {
    if (isDemoScreen('chat')) {
      const msg = buildMockChatMessage(body);
      const referralId = conversationId.startsWith('conv-')
        ? conversationId.slice(5)
        : conversationId;
      appendChatMessage(referralId, msg);
      return Promise.resolve(msg);
    }
    return request<{ data: ChatMessage }>(
      `/api/v1/chat/${conversationId}/messages/`,
      { method: 'POST', body: JSON.stringify({ body }) },
    ).then((r) => r.data);
  },

  subscribeToMessages: (
    referralId: string,
    onMessage: (msg: ChatMessage) => void,
  ) => {
    if (isDemoScreen('chat')) return { unsubscribe: () => {} };
    return pollForMessages(referralId, onMessage);
  },
};
