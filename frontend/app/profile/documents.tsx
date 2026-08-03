import type { ReactElement } from 'react';
import { SeekerProfileScreen } from '../../src/screens/SeekerProfileScreen';

export default function DocumentsRoute(): ReactElement {
  return <SeekerProfileScreen state="documents" />;
}
