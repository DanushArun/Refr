import type { ReactElement } from 'react';
import { LightJourneyScreen } from '../../src/screens/LightJourneyScreen';

export default function PipelineRoute(): ReactElement {
  return <LightJourneyScreen role="endorser" surface="candidates" />;
}
