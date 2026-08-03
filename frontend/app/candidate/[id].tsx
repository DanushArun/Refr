import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CandidateEvidenceScreen } from '../../src/screens/CandidateEvidenceScreen';

export default function CandidateRoute(): ReactElement {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  return <CandidateEvidenceScreen state={tab === 'impact' ? 'impact' : 'profile'} />;
}
