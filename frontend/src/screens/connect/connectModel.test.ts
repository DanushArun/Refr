import { connectSteps } from './connectModel';
test('connect states follow the catalogue',()=>expect(connectSteps).toEqual(['confirmed','inbox','filter','chat']));
