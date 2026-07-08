import { groupMessages } from './chatLogic';
import type { Message } from './chatLogic';

function message(id: string): Message {
  return {
    id,
    body: id,
    createdAt: '2026-07-08T00:00:00.000Z',
    sender: { id: 'user-1', displayName: 'Danush Arun' },
  };
}

describe('chatLogic', () => {
  test('test_group_messages_when_duplicate_ids_present_expected_single_body', () => {
    const groups = groupMessages([message('msg-1'), message('msg-1')]);

    expect(groups.flatMap((group) => group.bodies).map((body) => body.id)).toEqual(['msg-1']);
  });
});
