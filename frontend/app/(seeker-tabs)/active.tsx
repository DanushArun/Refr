import type { ReactElement } from 'react';
import { LightJourneyScreen } from '../../src/screens/LightJourneyScreen';

export default function ActiveRoute(): ReactElement {
  return <LightJourneyScreen role="seeker" surface="activity" />;
}
