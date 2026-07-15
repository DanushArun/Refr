import {
  defaultSharedFields,
  requestIntentCopy,
  toggleSharedField,
} from './requestDraft';

describe('request draft', () => {
  test('defaultSharedFields_when_introduction_expected_scoped_context', () => {
    expect(defaultSharedFields('introduction')).toEqual([
      'headline',
      'skills',
      'yearsOfExperience',
      'currentCompany',
      'location',
    ]);
  });

  test('toggleSharedField_when_field_is_selected_expected_removed', () => {
    expect(toggleSharedField(['headline', 'skills'], 'skills')).toEqual(['headline']);
  });

  test('requestIntentCopy_when_advice_expected_human_explanation', () => {
    expect(requestIntentCopy('advice').title).toBe('Ask for perspective');
  });
});
