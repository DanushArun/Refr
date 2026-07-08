import { ALL_ROLE_TABS, tabIsVisibleForRole, tabsForRole } from './roleTabs';

test('test_tabsForRole_whenSeeker_returnsSeekerTabSet', (): void => {
  expect(tabsForRole('seeker').map((tab) => tab.name)).toEqual([
    'discover',
    'matches',
    'pipeline',
    'profile',
  ]);
});

test('test_tabsForRole_whenReferrer_returnsReferrerTabSet', (): void => {
  expect(tabsForRole('referrer').map((tab) => tab.name)).toEqual([
    'discover',
    'inbox',
    'active',
    'earnings',
    'profile',
  ]);
});

test('test_allRoleTabs_whenRouteGroupIsAmbiguous_containsEveryTabFile', (): void => {
  expect(ALL_ROLE_TABS.map((tab) => tab.name)).toEqual([
    'discover',
    'matches',
    'pipeline',
    'inbox',
    'active',
    'earnings',
    'profile',
  ]);
});

test('test_tabIsVisibleForRole_whenSeeker_hidesReferrerOnlyTabs', (): void => {
  expect(tabIsVisibleForRole('matches', 'seeker')).toBe(true);
  expect(tabIsVisibleForRole('pipeline', 'seeker')).toBe(true);
  expect(tabIsVisibleForRole('inbox', 'seeker')).toBe(false);
  expect(tabIsVisibleForRole('earnings', 'seeker')).toBe(false);
});
