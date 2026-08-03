import { removeCard, saveCard } from './savedCards';

const card = {
  id: 'role-1',
  title: 'Senior Backend Engineer',
  subtitle: 'Razorpay',
  detail: '84% match',
  path: '/opportunity/role-1',
};

test('adds a newly saved discovery card to the top of the collection', () => {
  expect(saveCard([], card)).toEqual([card]);
});

test('replaces a saved card with the same id instead of duplicating it', () => {
  expect(saveCard([{ ...card, detail: 'stale' }], card)).toEqual([card]);
});

test('removes a saved discovery card by id', () => {
  expect(removeCard([card], card.id)).toEqual([]);
});
