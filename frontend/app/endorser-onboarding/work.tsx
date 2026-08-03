import { useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';
import { EndorserOnboardingScreen } from '../../src/screens/EndorserOnboardingScreen';

export default function WorkRoute(): ReactElement {
  const { state } = useLocalSearchParams<{ state?: string }>();
  return <EndorserOnboardingScreen state={state === 'checking' ? 'checking' : 'work'} />;
}
