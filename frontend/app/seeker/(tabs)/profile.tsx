import type { ReactElement } from 'react';
import { SeekerProfileScreen } from '../../../src/screens/SeekerProfileScreen';

export default function ProfileRoute(): ReactElement {
  return <SeekerProfileScreen state="overview" />;
}
