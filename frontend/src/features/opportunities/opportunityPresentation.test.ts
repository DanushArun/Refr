import {
  formatEmploymentType,
  formatExperience,
  formatExpiry,
  formatFreshness,
  formatSource,
  formatWorkplace,
} from './opportunityPresentation';

describe('opportunity presentation', () => {
  test('test_format_workplace_when_remote_expected_human_label', () => {
    expect(formatWorkplace('remote', 'Bengaluru, Remote')).toBe('Remote · Bengaluru');
  });

  test('test_format_experience_when_range_is_open_expected_minimum_label', () => {
    expect(formatExperience(5, null)).toBe('5+ years');
  });

  test('test_format_freshness_when_posted_today_expected_today_label', () => {
    const now = new Date('2026-07-10T12:00:00.000Z');

    expect(formatFreshness('2026-07-10T07:00:00.000Z', now)).toBe('Posted today');
  });

  test('test_format_freshness_when_date_is_invalid_expected_unavailable_label', () => {
    expect(formatFreshness('not-a-date')).toBe('Posting date unavailable');
  });

  test('test_format_employment_type_when_full_time_expected_human_label', () => {
    expect(formatEmploymentType('full_time')).toBe('Full time');
  });

  test('test_format_expiry_when_date_exists_expected_closing_label', () => {
    expect(formatExpiry('2026-07-31T00:00:00.000Z')).toBe('Closes Jul 31');
  });

  test('test_format_expiry_when_date_is_missing_expected_no_label', () => {
    expect(formatExpiry(null)).toBeNull();
  });

  test('test_format_source_when_company_intel_expected_truthful_label', () => {
    expect(formatSource('company_intel')).toBe('Company intel');
  });
});
