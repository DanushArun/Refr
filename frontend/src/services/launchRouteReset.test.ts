interface LaunchRouteResetModule {
  consumeLaunchRouteReset: () => boolean;
  settleLaunchRoute: () => void;
}

function loadLaunchRouteReset(): LaunchRouteResetModule {
  let loadedModule: LaunchRouteResetModule | null = null;
  jest.isolateModules(() => {
    loadedModule = require('./launchRouteReset') as LaunchRouteResetModule;
  });

  if (!loadedModule) {
    throw new Error('Failed to load launch route reset module');
  }

  return loadedModule;
}

describe('launchRouteReset', () => {
  test('test_consumeLaunchRouteReset_when_first_call_returns_true', (): void => {
    const launchRouteReset = loadLaunchRouteReset();

    expect(launchRouteReset.consumeLaunchRouteReset()).toBe(true);
  });

  test('test_consumeLaunchRouteReset_when_called_twice_returns_false', (): void => {
    const launchRouteReset = loadLaunchRouteReset();
    launchRouteReset.consumeLaunchRouteReset();

    expect(launchRouteReset.consumeLaunchRouteReset()).toBe(false);
  });

  test('test_consumeLaunchRouteReset_when_settled_returns_false', (): void => {
    const launchRouteReset = loadLaunchRouteReset();
    launchRouteReset.settleLaunchRoute();

    expect(launchRouteReset.consumeLaunchRouteReset()).toBe(false);
  });
});
