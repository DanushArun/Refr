import { offerStates } from './offerModel';
test('offer states follow the catalogue',()=>expect(offerStates).toEqual(['pending','received','review','accepted']));
