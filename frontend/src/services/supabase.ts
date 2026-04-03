import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Supabase client initialization.
 *
 * Environment values come from app.json > extra, injected via expo-constants.
 * For local development copy app.json and fill in supabaseUrl + supabaseAnonKey.
 * Never commit real keys — use EAS Secrets for production builds.
 */
const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[Supabase] supabaseUrl or supabaseAnonKey is not set in app.json > extra. ' +
    'Auth and database calls will fail until these are configured.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native uses AsyncStorage; Supabase v2 handles this automatically
    // when no custom storage is supplied on React Native targets
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
