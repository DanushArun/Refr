export type SwipeAction = 'pass' | 'request' | 'save' | 'reset';

export interface SwipeTranslation {
  translationX: number;
  translationY: number;
  velocityX?: number;
  velocityY?: number;
}

const HORIZONTAL_THRESHOLD = 110;
const UPWARD_THRESHOLD = 120;
const HORIZONTAL_VELOCITY_THRESHOLD = 800;

export function decideSwipe({
  translationX,
  translationY,
  velocityX = 0,
}: SwipeTranslation): SwipeAction {
  'worklet';
  const horizontalDistance = Math.abs(translationX);
  const upwardDistance = Math.max(0, -translationY);

  if (upwardDistance > horizontalDistance && upwardDistance >= UPWARD_THRESHOLD) {
    return 'save';
  }
  if (
    horizontalDistance < HORIZONTAL_THRESHOLD &&
    Math.abs(velocityX) < HORIZONTAL_VELOCITY_THRESHOLD
  ) {
    return 'reset';
  }
  return translationX > 0 ? 'request' : 'pass';
}
