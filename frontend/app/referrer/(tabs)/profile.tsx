import type { ReactElement } from 'react';
import { EndorserAccountScreen } from '../../../src/screens/EndorserAccountScreen';

export default function ProfileRoute(): ReactElement {
  return <EndorserAccountScreen state="profile" />;
}
