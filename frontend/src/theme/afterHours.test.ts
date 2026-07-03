import {
  afterHoursBrand,
  afterHoursDetonations,
  isVermilionAllowed,
} from './afterHours';
import { colors } from './colors';

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

test('test_colors_whenPositiveSemantic_usesSage', () => {
  expect(colors.success).toBe(afterHoursBrand.colors.sage);
});

test('test_colors_whenNegativeSemantic_usesVermilion', () => {
  expect(colors.error).toBe(afterHoursBrand.colors.vermilion);
});

test('test_colors_whenRankSemantic_usesBrass', () => {
  expect(colors.goldBright).toBe(afterHoursBrand.colors.brass);
});

test('test_colors_whenPipelineAccepted_usesSage', () => {
  expect(colors.pipelineAccepted).toBe(afterHoursBrand.colors.sage);
});

test('test_colors_whenPipelineRejected_usesVermilion', () => {
  expect(colors.pipelineRejected).toBe(afterHoursBrand.colors.vermilion);
});
