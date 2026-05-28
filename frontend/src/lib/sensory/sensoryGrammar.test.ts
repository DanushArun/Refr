import { getSensoryRecipe } from './sensoryGrammar';

describe('sensoryGrammar', () => {
  test('getSensoryRecipe_whenFeedArrivalPassive_returnsNoHaptic', () => {
    const recipe = getSensoryRecipe('feed.liveArrival', {
      hapticsEnabled: true,
      reduceMotion: false,
    });

    expect(recipe.haptic).toBeNull();
  });

  test('getSensoryRecipe_whenReduceMotionEnabled_returnsInstantMotion', () => {
    const recipe = getSensoryRecipe('hire.confirmed', {
      hapticsEnabled: true,
      reduceMotion: true,
    });

    expect(recipe.motion).toBe('instant');
  });

  test('getSensoryRecipe_whenHapticsDisabled_returnsNoHaptic', () => {
    const recipe = getSensoryRecipe('endorsement.commit', {
      hapticsEnabled: false,
      reduceMotion: false,
    });

    expect(recipe.haptic).toBeNull();
  });

  test('getSensoryRecipe_whenHireConfirmed_returnsHirePhrase', () => {
    const recipe = getSensoryRecipe('hire.confirmed', {
      hapticsEnabled: true,
      reduceMotion: false,
    });

    expect(recipe.haptic).toBe('hire');
  });

  test('getSensoryRecipe_whenScoreDelta_returnsStandardMotion', () => {
    const recipe = getSensoryRecipe('score.delta', {
      hapticsEnabled: true,
      reduceMotion: false,
    });

    expect(recipe.motion).toBe('standard');
  });
});
