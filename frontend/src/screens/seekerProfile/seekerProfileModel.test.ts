import { seekerProfileStates } from './seekerProfileModel';
test('profile states follow the catalogue',()=>expect(seekerProfileStates).toEqual(['overview','documents','preferences','privacy']));
