import { decideSwipe } from './swipeDecision';

test('passes when a left swipe clears the horizontal threshold', () => {
  expect(decideSwipe({ translationX: -121, translationY: 12 })).toBe('pass');
});

test('requests when a right swipe clears the horizontal threshold', () => {
  expect(decideSwipe({ translationX: 121, translationY: 12 })).toBe('request');
});

test('saves when an upward swipe is the dominant gesture', () => {
  expect(decideSwipe({ translationX: 80, translationY: -141 })).toBe('save');
});

test('snaps back when a gesture does not clear an action threshold', () => {
  expect(decideSwipe({ translationX: 60, translationY: -40 })).toBe('reset');
});

test('commits a fast horizontal flick before the distance threshold', () => {
  expect(
    decideSwipe({ translationX: -50, translationY: 4, velocityX: -850, velocityY: 0 }),
  ).toBe('pass');
});
