import { trackingStates } from './trackingModel';
test('tracking states follow the catalogue',()=>expect(trackingStates).toEqual(['shared','submitted','overview','timeline']));
