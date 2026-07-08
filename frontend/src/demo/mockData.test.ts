import { appendChatMessage, chatForReferral } from './mockData';
import type { ChatMessage } from '../services/api';

function message(id: string): ChatMessage {
  return {
    id,
    body: id,
    createdAt: '2026-07-08T00:00:00.000Z',
    sender: { id: 'user-1', displayName: 'Danush Arun' },
  };
}

describe('mockData chat history', () => {
  test('test_append_chat_message_when_same_id_replayed_expected_single_insert', () => {
    const referralId = 'test-ref-idempotent';

    appendChatMessage(referralId, message('msg-replayed'));
    appendChatMessage(referralId, message('msg-replayed'));

    const replayed = chatForReferral(referralId).filter((entry) => entry.id === 'msg-replayed');

    expect(replayed).toHaveLength(1);
  });

  test('test_chat_for_referral_when_consumer_mutates_result_expected_store_unchanged', () => {
    const referralId = 'test-ref-copy';
    const messages = chatForReferral(referralId);

    messages.push(message('msg-external-mutation'));

    const hasMutation = chatForReferral(referralId)
      .some((entry) => entry.id === 'msg-external-mutation');

    expect(hasMutation).toBe(false);
  });
});
