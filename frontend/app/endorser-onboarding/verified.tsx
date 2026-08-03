import type { ReactElement } from 'react';
import { EndorserOnboardingScreen } from '../../src/screens/EndorserOnboardingScreen';

export default function VerifiedRoute(): ReactElement {
  return <EndorserOnboardingScreen state="verified" />;
}
