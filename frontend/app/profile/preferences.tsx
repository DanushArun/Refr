import type { ReactElement } from 'react';
import { SeekerProfileScreen } from '../../src/screens/SeekerProfileScreen';

export default function PreferencesRoute(): ReactElement {
  return <SeekerProfileScreen state="preferences" />;
}
