import type { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { EndorserDiscoverScreen } from '../../src/screens/EndorserDiscoverScreen';
import { endorserDiscoverStateFromParams } from '../../src/screens/endorserDiscover/endorserDiscoverModel';

export default function EndorserDiscoverRoute(): ReactElement {
  const params = useLocalSearchParams<{ sheet?: string; state?: string }>();
  return <EndorserDiscoverScreen state={endorserDiscoverStateFromParams(params)} />;
}
