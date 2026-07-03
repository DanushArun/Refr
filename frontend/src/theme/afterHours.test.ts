import {
  afterHoursBrand,
  afterHoursDetonations,
  isVermilionAllowed,
} from './afterHours';

test('test_afterHoursBrand_whenLoaded_exposesCanonicalPalette', () => {
  expect(afterHoursBrand.colors).toEqual({
    midnight: '#0C1F19',
    velvet: '#16352B',
    parchment: '#F4EDDD',
    vermilion: '#FF4D2E',
    brass: '#D9A441',
    sage: '#9DB5A4',
  });
});

test('test_afterHoursBrand_whenRenderingDetonation_usesExactVermilionFill', () => {
  expect(afterHoursBrand.fills.vermilionDetonation).toEqual([
    '#FF4D2E',
    '#FF4D2E',
    '#FF4D2E',
  ]);
});

test('test_isVermilionAllowed_whenUsedOutsideEndorsementMoments_returnsFalse', () => {
  expect(isVermilionAllowed('status')).toBe(false);
  expect(isVermilionAllowed('decoration')).toBe(false);
  expect(isVermilionAllowed('endorse-action')).toBe(true);
});

test('test_afterHoursDetonations_whenTriggered_useMemberFavorCopy', () => {
  expect(afterHoursDetonations.matchAccepted.headline).toBe('Consider it done.');
  expect(afterHoursDetonations.firstEndorsementLanding.headline).toBe('Your name is in.');
  expect(afterHoursDetonations.tierUpgrade.headline).toBe("You're in the next room.");
});
