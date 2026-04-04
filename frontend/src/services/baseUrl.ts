import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiBaseUrl;
  if (configured && configured !== 'http://127.0.0.1:8000') {
    return configured;
  }
  if (__DEV__) {
    const debuggerHost =
      Constants.expoConfig?.hostUri
      ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
      ?? Constants.manifest?.debuggerHost;
    if (debuggerHost) {
      const lanIp = debuggerHost.split(':')[0];
      return `http://${lanIp}:8000`;
    }
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
}

export const BASE_URL: string = resolveBaseUrl();
