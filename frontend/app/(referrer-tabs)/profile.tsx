import type { ReactElement } from 'react';
import { LightJourneyScreen } from '../../src/screens/LightJourneyScreen';

export default function ProfileRoute(): ReactElement {
  return <LightJourneyScreen role="endorser" surface="profile" />;
}
