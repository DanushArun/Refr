import type { ReactElement } from 'react';
import { TrackingScreen } from '../../src/screens/TrackingScreen';

export default function ActiveRoute(): ReactElement {
  return <TrackingScreen state="overview" />;
}
