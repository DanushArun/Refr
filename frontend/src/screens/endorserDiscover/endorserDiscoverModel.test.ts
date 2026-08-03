import { endorserDiscoverStates, endorserDiscoverStateFromParams } from './endorserDiscoverModel';

test('endorser discovery uses every visible catalogue state', () => {
  expect(endorserDiscoverStates).toEqual(['tutorial', 'candidate', 'fit', 'passed']);
});

test('discovery query parameters select the documented visual state', () => {
  expect(endorserDiscoverStateFromParams({ sheet: 'fit' })).toBe('fit');
  expect(endorserDiscoverStateFromParams({ state: 'passed' })).toBe('passed');
});
