import { candidateEvidenceStates, candidateEvidenceRoute } from './candidateEvidenceModel';

test('candidate evidence includes every catalogue panel', () => {
  expect(candidateEvidenceStates).toEqual(['profile', 'impact', 'resume', 'trust']);
});

test('the candidate profile opens the trusted connection form', () => {
  expect(candidateEvidenceRoute('profile')).toBe('/candidate/priya-nair/connect');
});
