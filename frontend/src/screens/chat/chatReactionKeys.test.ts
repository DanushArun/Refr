import { keyReactions } from './chatReactionKeys';

test('test_keyReactions_whenDuplicateEmojiExist_returnsStableOccurrenceKeys', () => {
  expect(keyReactions(['👍', '🔥', '👍'])).toEqual([
    { emoji: '👍', key: '👍-1' },
    { emoji: '🔥', key: '🔥-1' },
    { emoji: '👍', key: '👍-2' },
  ]);
});
