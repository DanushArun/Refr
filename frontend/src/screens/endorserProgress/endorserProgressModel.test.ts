import { endorserProgressStates, endorserProgressRoute } from './endorserProgressModel';

test('candidate progress covers review through joined verification', () => {
  expect(endorserProgressStates).toEqual([
    'list', 'review', 'interview', 'decision', 'offer', 'accepted', 'joined', 'verification',
  ]);
});

test('a submitted referral opens candidate review', () => {
  expect(endorserProgressRoute('submitted')).toBe('/endorser/candidates/priya-razo');
});
