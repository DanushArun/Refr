import { endorserConnectionStates, nextEndorserConnectionRoute } from './endorserConnectionModel';

test('endorser connection moves from a private note to the sent confirmation', () => {
  expect(endorserConnectionStates).toEqual(['message', 'sent']);
  expect(nextEndorserConnectionRoute('message')).toBe('/candidate/priya-nair/connect/sent');
});
