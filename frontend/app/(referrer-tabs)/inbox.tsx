import type { ReactElement } from 'react';
import { LightJourneyScreen } from '../../src/screens/LightJourneyScreen';

export default function EndorserInboxRoute(): ReactElement {
  return <LightJourneyScreen role="endorser" surface="inbox" />;
}
