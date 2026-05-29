import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  HAPTICS_ENABLED_KEY,
  getHapticsEnabledSnapshot,
  loadHapticsPreference,
  resetHapticsPreferenceForTests,
  setHapticsEnabledPreference,
} from './sensoryPreferences';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const storage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('sensoryPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetHapticsPreferenceForTests();
  });

  test('loadHapticsPreference_whenStorageEmpty_defaultsToEnabled', async () => {
    storage.getItem.mockResolvedValue(null);

    const enabled = await loadHapticsPreference();

    expect(enabled).toBe(true);
  });

  test('loadHapticsPreference_whenStoredFalse_returnsDisabled', async () => {
    storage.getItem.mockResolvedValue('false');

    const enabled = await loadHapticsPreference();

    expect(enabled).toBe(false);
  });

  test('setHapticsEnabledPreference_whenFalse_persistsDisabledState', async () => {
    await setHapticsEnabledPreference(false);

    expect(storage.setItem).toHaveBeenCalledWith(HAPTICS_ENABLED_KEY, 'false');
  });

  test('getHapticsEnabledSnapshot_whenSetFalse_returnsFalse', async () => {
    await setHapticsEnabledPreference(false);

    expect(getHapticsEnabledSnapshot()).toBe(false);
  });
});
