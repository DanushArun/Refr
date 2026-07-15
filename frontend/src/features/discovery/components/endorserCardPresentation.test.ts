import {
  endorserAboutText,
  endorserActivityLine,
} from './endorserCardPresentation';

test('test_endorser_activity_line_when_facts_missing_expected_hidden', () => {
  expect(endorserActivityLine({})).toBeNull();
});

test('test_endorser_activity_line_when_facts_available_expected_truthful_summary', () => {
  expect(endorserActivityLine({ hires: 3, responseTime: '~2hr' }))
    .toBe('3 hires · ~2hr reply');
});

test('test_endorser_about_text_when_activity_missing_expected_identity_only', () => {
  expect(endorserAboutText({ companyName: 'Stripe', jobTitle: 'Engineer' }))
    .toBe('Works at Stripe as Engineer.');
});
