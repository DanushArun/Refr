import type { ReactElement } from 'react';
import { EndorserConnectionScreen } from '../../../../src/screens/EndorserConnectionScreen';

export default function CandidateConnectSentRoute(): ReactElement {
  return <EndorserConnectionScreen state="sent" />;
}
