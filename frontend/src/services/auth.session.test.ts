const secureStore = {
  deleteItemAsync: jest.fn<Promise<void>, [string]>(),
  getItemAsync: jest.fn<Promise<string | null>, [string]>(),
  setItemAsync: jest.fn<Promise<void>, [string, string]>(),
};

jest.mock('expo-secure-store', () => secureStore);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('./baseUrl', () => ({ BASE_URL: 'http://localhost:8000' }));

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

import { getSession, saveSession, signOut } from './auth';

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  user: { email: 'seeker@example.com', id: 'user-1', role: 'seeker' as const },
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('stores an authenticated session in secure native storage', async () => {
  await saveSession(session);

  expect(secureStore.setItemAsync).toHaveBeenCalledWith(
    'auth_session',
    JSON.stringify(session),
  );
});

test('reads an authenticated session from secure native storage', async () => {
  secureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(session));

  await expect(getSession()).resolves.toEqual(session);
});

test('removes a malformed secure session instead of crashing on launch', async () => {
  secureStore.getItemAsync.mockResolvedValueOnce('not-json');

  await expect(getSession()).resolves.toBeNull();
  expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('auth_session');
});

test('clears the secure session on sign out', async () => {
  await signOut();

  expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('auth_session');
});

test('returns a sign out error when secure storage cannot clear the session', async () => {
  secureStore.deleteItemAsync.mockRejectedValueOnce(new Error('Keychain unavailable'));

  await expect(signOut()).resolves.toEqual({ error: new Error('Keychain unavailable') });
});
