import { interviewStates } from './interviewModel';

test('interview states preserve the catalogue progression', () => {
  expect(interviewStates).toEqual(['review', 'invitation', 'time', 'preparation']);
});
