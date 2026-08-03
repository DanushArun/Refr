import { endorserInboxSections } from './endorserInboxModel';

test('endorser inbox separates active connections from conversations', () => {
  expect(endorserInboxSections).toEqual(['active-connections', 'conversations']);
});
