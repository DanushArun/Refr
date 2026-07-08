import {
  type NavigationDescriptors,
  type NavigationRoute,
  visibleRoleRoutes,
} from './visibleTabRoutes';

const routes: NavigationRoute[] = [
  { key: 'discover-key', name: 'discover' },
  { key: 'matches-key', name: 'matches' },
  { key: 'inbox-key', name: 'inbox' },
  { key: 'profile-key', name: 'profile' },
];

const descriptors: NavigationDescriptors = {
  'discover-key': { options: {} },
  'matches-key': { options: {} },
  'inbox-key': { options: {} },
  'profile-key': { options: {} },
};

test('test_visibleRoleRoutes_whenSeeker_hidesReferrerOnlyRoutes', (): void => {
  expect(visibleRoleRoutes(routes, descriptors, 'seeker').map((route) => route.name)).toEqual([
    'discover',
    'matches',
    'profile',
  ]);
});

test('test_visibleRoleRoutes_whenReferrer_hidesSeekerOnlyRoutes', (): void => {
  expect(visibleRoleRoutes(routes, descriptors, 'referrer').map((route) => route.name)).toEqual([
    'discover',
    'inbox',
    'profile',
  ]);
});

test('test_visibleRoleRoutes_whenRouteHrefNull_hidesRoute', (): void => {
  expect(
    visibleRoleRoutes(
      routes,
      { ...descriptors, 'matches-key': { options: { href: null } } },
      'seeker',
    ).map((route) => route.name),
  ).toEqual(['discover', 'profile']);
});
