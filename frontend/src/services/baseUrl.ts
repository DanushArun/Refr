import Constants from 'expo-constants';
import { Platform } from 'react-native';

function isLoopback(url: string): boolean {
  return url.startsWith('http://127.0.0.1:') || url.startsWith('http://localhost:');
}

function debuggerHostBase(): string | undefined {
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    (Constants.expoConfig as any)?.extra?.expoGo?.debuggerHost;
  if (!debuggerHost) return undefined;
  const host = debuggerHost.split(':')[0];
  return `http://${host}:8000`;
}

function resolveBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiBaseUrl;
  const publicEnvUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configured && !isLoopback(configured)) {
    return configured;
  }
  if (__DEV__) {
    if (publicEnvUrl && !isLoopback(publicEnvUrl)) return publicEnvUrl;
    const hostUrl = debuggerHostBase();
    if (hostUrl) return hostUrl;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  if (publicEnvUrl) {
    return publicEnvUrl;
  }
  return 'http://127.0.0.1:8000';
}

export const BASE_URL: string = resolveBaseUrl();
