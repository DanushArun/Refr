import type React from 'react';

import { isDemoScreen } from '../../demo/config';
import { chatApi } from '../../services/api';
import { sendWithOptimism } from './chatActions';
import type { DeliveryState, Message } from './chatLogic';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('../../services/api', () => ({
  chatApi: { sendMessage: jest.fn() },
  referralsApi: { transition: jest.fn() },
}));

jest.mock('../../utils/haptics', () => ({
  Phrase: { messageSent: jest.fn() },
  playSensoryEvent: jest.fn(),
}));

jest.mock('../../demo/config', () => ({
  isDemoScreen: jest.fn(),
}));

const sendMessageMock = chatApi.sendMessage as jest.MockedFunction<typeof chatApi.sendMessage>;
const isDemoScreenMock = isDemoScreen as jest.MockedFunction<typeof isDemoScreen>;

function message(id: string, senderId = 'user-1'): Message {
  return {
    id,
    body: id,
    createdAt: '2026-07-08T00:00:00.000Z',
    sender: { id: senderId, displayName: 'Danush Arun' },
  };
}

function applyState<T>(state: T, action: React.SetStateAction<T>): T {
  if (typeof action === 'function') return (action as (prev: T) => T)(state);
  return action;
}

describe('chatActions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    isDemoScreenMock.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('test_send_with_optimism_when_sent_message_already_exists_expected_deduped', async () => {
    const temp = message('temp-1');
    const sent = message('sent-1');
    let messages = [temp, sent];
    let deliveryStates: Record<string, DeliveryState> = { [temp.id]: 'sending' };

    sendMessageMock.mockResolvedValue(sent);

    await sendWithOptimism({
      body: sent.body,
      conversationId: 'conv-1',
      participantName: 'Nivrant Goswami',
      setDeliveryStates: (action) => {
        deliveryStates = applyState(deliveryStates, action);
      },
      setDraft: jest.fn(),
      setMessages: (action) => {
        messages = applyState(messages, action);
      },
      setSending: jest.fn(),
      setTyping: jest.fn(),
      simulatedReplyFired: { current: true },
      stage: 'matched',
      temp,
    });

    expect(messages.map((entry) => entry.id)).toEqual(['sent-1']);
  });

  test('test_send_with_optimism_when_live_expected_no_simulated_activity', async () => {
    const temp = message('temp-live');
    const sent = message('sent-live');
    let messages = [temp];
    let deliveryStates: Record<string, DeliveryState> = { [temp.id]: 'sending' };
    const setTyping = jest.fn();
    sendMessageMock.mockResolvedValue(sent);

    await sendWithOptimism({
      body: sent.body,
      conversationId: 'conv-live',
      participantName: 'Nivrant Goswami',
      setDeliveryStates: (action) => {
        deliveryStates = applyState(deliveryStates, action);
      },
      setDraft: jest.fn(),
      setMessages: (action) => {
        messages = applyState(messages, action);
      },
      setSending: jest.fn(),
      setTyping,
      simulatedReplyFired: { current: false },
      stage: 'matched',
      temp,
    });
    jest.runAllTimers();

    expect({ deliveryStates, ids: messages.map(({ id }) => id), typing: setTyping.mock.calls })
      .toEqual({ deliveryStates: { 'sent-live': 'sent' }, ids: ['sent-live'], typing: [] });
  });

  test('test_send_with_optimism_when_demo_expected_simulated_activity', async () => {
    const temp = message('temp-demo');
    const sent = message('sent-demo');
    let messages = [temp];
    let deliveryStates: Record<string, DeliveryState> = { [temp.id]: 'sending' };
    const typing: boolean[] = [];
    isDemoScreenMock.mockReturnValue(true);
    sendMessageMock.mockResolvedValue(sent);

    await sendWithOptimism({
      body: sent.body,
      conversationId: 'conv-demo',
      participantName: 'Nivrant Goswami',
      setDeliveryStates: (action) => {
        deliveryStates = applyState(deliveryStates, action);
      },
      setDraft: jest.fn(),
      setMessages: (action) => {
        messages = applyState(messages, action);
      },
      setSending: jest.fn(),
      setTyping: (value) => typing.push(value),
      simulatedReplyFired: { current: false },
      stage: 'matched',
      temp,
    });
    jest.runAllTimers();

    expect({ deliveryStates, messageCount: messages.length, typing }).toEqual({
      deliveryStates: { 'sent-demo': 'read' },
      messageCount: 2,
      typing: [true, false],
    });
  });
});
