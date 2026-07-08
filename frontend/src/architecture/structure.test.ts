import fs from 'fs';
import path from 'path';

const frontendRoot = path.resolve(__dirname, '../..');
const srcRoot = path.join(frontendRoot, 'src');

const featureNames = [
  'auth',
  'discovery',
  'endorsements',
  'chat',
  'activity',
  'profile',
  'reputation',
  'notifications',
] as const;

const sharedNames = ['ui', 'layout', 'hooks', 'storage', 'utils'] as const;

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(frontendRoot, relativePath));
}

describe('frontend architecture structure', () => {
  it.each(featureNames)('keeps %s inside src/features', (featureName) => {
    expect(fs.statSync(path.join(srcRoot, 'features', featureName)).isDirectory()).toBe(true);
  });

  it.each(featureNames)('keeps feature API entrypoint for %s', (featureName) => {
    expect(exists(`src/features/${featureName}/api.ts`)).toBe(true);
  });

  it.each(sharedNames)('keeps shared %s inside src/shared', (sharedName) => {
    expect(fs.statSync(path.join(srcRoot, 'shared', sharedName)).isDirectory()).toBe(true);
  });

  it.each(sharedNames)('keeps shared %s barrel file', (sharedName) => {
    expect(exists(`src/shared/${sharedName}/index.ts`)).toBe(true);
  });

  it('keeps demo configuration outside production config', () => {
    expect(exists('src/demo/config.ts')).toBe(true);
  });

  it('removes the old demo config location', () => {
    expect(exists('src/config/demo.ts')).toBe(false);
  });

  it('removes swipe-era discover components', () => {
    expect(exists('src/components/discover')).toBe(false);
  });

  it('removes swipe-era discover logic', () => {
    expect(exists('src/lib/discover')).toBe(false);
  });


  it('keeps the backend contract snapshot in the frontend repo', () => {
    expect(exists('contracts/endorsly.v1.yaml')).toBe(true);
  });

  it('keeps generated OpenAPI types under the API service boundary', () => {
    expect(exists('src/services/api/generated/endorsly.d.ts')).toBe(true);
  });

  it('keeps typed OpenAPI transport under the API service boundary', () => {
    expect(exists('src/services/api/transport.ts')).toBe(true);
  });

  it('keeps recommendation API under the API service boundary', () => {
    expect(exists('src/services/api/recommendations.ts')).toBe(true);
  });

  it('keeps root API module as an export surface', () => {
    const rootApi = fs.readFileSync(path.join(frontendRoot, 'src/services/api.ts'), 'utf8');

    expect(rootApi).toContain("export * from './api/client';");
    expect(rootApi).toContain("export * from './api/recommendations';");
  });

  it('keeps contract type generation as a package script', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(frontendRoot, 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts['contract:types']).toContain('openapi-typescript');
  });

  it('keeps seeker swipe discovery screen under the discovery feature', () => {
    expect(exists('src/features/discovery/screens/SeekerSwipeDiscoverScreen.tsx')).toBe(true);
  });

  it('keeps referrer swipe discovery screen under the discovery feature', () => {
    expect(exists('src/features/discovery/screens/ReferrerSwipeDiscoverScreen.tsx')).toBe(true);
  });

  it('keeps role-aware discovery screen under the discovery feature', () => {
    expect(exists('src/features/discovery/screens/RoleDiscoverScreen.tsx')).toBe(true);
  });

  it('keeps the swipe deck under the discovery feature', () => {
    expect(exists('src/features/discovery/components/SwipeDeck.tsx')).toBe(true);
  });

  it('keeps match reveal logic under the discovery feature', () => {
    expect(exists('src/features/discovery/logic/matchReveal.ts')).toBe(true);
  });

  it('keeps recommendation mappers under the discovery feature', () => {
    expect(exists('src/features/discovery/mappers.ts')).toBe(true);
  });

  it('routes seeker discovery through the role-aware discover screen', () => {
    const route = fs.readFileSync(path.join(frontendRoot, 'app/(seeker-tabs)/discover.tsx'));

    expect(route.includes('RoleDiscoverScreen')).toBe(true);
  });

  it('routes referrer discovery through the role-aware discover screen', () => {
    const route = fs.readFileSync(path.join(frontendRoot, 'app/(referrer-tabs)/discover.tsx'));

    expect(route.includes('RoleDiscoverScreen')).toBe(true);
  });

  it('role-aware discovery screen chooses both swipe surfaces', () => {
    const route = fs.readFileSync(
      path.join(frontendRoot, 'src/features/discovery/screens/RoleDiscoverScreen.tsx'),
      'utf8',
    );

    expect(route.includes('SeekerSwipeDiscoverScreen')).toBe(true);
    expect(route.includes('ReferrerSwipeDiscoverScreen')).toBe(true);
  });
});
