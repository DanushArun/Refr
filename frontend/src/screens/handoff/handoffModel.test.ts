import { handoffStates } from './handoffModel';
test('handoff preserves detail and consent order',()=>expect(handoffStates).toEqual(['conversation','requested','share','confirm']));
