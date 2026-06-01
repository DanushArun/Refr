import {
  buildDotMatrixPoints,
  clampDotMatrixProgress,
  splitDotMatrixPoints,
} from './dotMatrix';

test('test_buildDotMatrixPoints_when_size_has_even_cells_returns_centered_points', () => {
  expect(buildDotMatrixPoints({ width: 16, height: 16, cellSize: 8 })).toEqual([
    { x: 4, y: 4 },
    { x: 12, y: 4 },
    { x: 4, y: 12 },
    { x: 12, y: 12 },
  ]);
});

test('test_splitDotMatrixPoints_when_progress_is_half_returns_left_side_lit', () => {
  expect(
    splitDotMatrixPoints({
      points: buildDotMatrixPoints({ width: 24, height: 8, cellSize: 8 }),
      progress: 0.5,
      width: 24,
    }).lit,
  ).toEqual([
    { x: 4, y: 4 },
    { x: 12, y: 4 },
  ]);
});

test('test_clampDotMatrixProgress_when_value_exceeds_bounds_returns_nearest_bound', () => {
  expect([clampDotMatrixProgress(-1), clampDotMatrixProgress(2)]).toEqual([0, 1]);
});
