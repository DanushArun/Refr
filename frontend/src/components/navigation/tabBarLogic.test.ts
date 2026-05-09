import {
  clampSlotIndex,
  indicatorXForIndex,
  shouldDispatchNavigation,
  slotIndexForFingerX,
} from './tabBarLogic';

describe('tabBarLogic — slotIndexForFingerX', () => {
  test('returns_0_when_finger_at_center_of_slot_0', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 16 + 0.5 * 80,
        tabWidth: 80,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(0);
  });

  test('returns_1_when_finger_at_center_of_slot_1', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 16 + 1.5 * 80,
        tabWidth: 80,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(1);
  });

  test('returns_last_index_when_finger_at_center_of_last_slot', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 16 + 3.5 * 80,
        tabWidth: 80,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(3);
  });

  test('clamps_low_when_finger_left_of_inner_padding', () => {
    expect(
      slotIndexForFingerX({
        fingerX: -50,
        tabWidth: 80,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(0);
  });

  test('clamps_high_when_finger_far_past_last_slot', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 9999,
        tabWidth: 80,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(3);
  });

  test('returns_0_defensively_when_tabCount_is_zero', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 100,
        tabWidth: 80,
        tabCount: 0,
        innerPadding: 16,
      }),
    ).toBe(0);
  });

  test('returns_0_defensively_when_tabWidth_is_zero', () => {
    expect(
      slotIndexForFingerX({
        fingerX: 100,
        tabWidth: 0,
        tabCount: 4,
        innerPadding: 16,
      }),
    ).toBe(0);
  });
});

describe('tabBarLogic — indicatorXForIndex', () => {
  test('returns_0_for_index_0', () => {
    expect(indicatorXForIndex(0, 80)).toBe(0);
  });

  test('returns_index_times_tabWidth_for_positive_index', () => {
    expect(indicatorXForIndex(2, 80)).toBe(160);
  });

  test('clamps_negative_index_to_0', () => {
    expect(indicatorXForIndex(-1, 80)).toBe(0);
  });
});

describe('tabBarLogic — clampSlotIndex', () => {
  test('returns_0_when_index_is_0_and_tabCount_4', () => {
    expect(clampSlotIndex(0, 4)).toBe(0);
  });

  test('returns_3_when_index_is_3_and_tabCount_4', () => {
    expect(clampSlotIndex(3, 4)).toBe(3);
  });

  test('clamps_index_4_down_to_last_valid_3_when_tabCount_4', () => {
    expect(clampSlotIndex(4, 4)).toBe(3);
  });

  test('clamps_negative_index_up_to_0', () => {
    expect(clampSlotIndex(-1, 4)).toBe(0);
  });

  test('returns_0_when_tabCount_is_0', () => {
    expect(clampSlotIndex(2, 0)).toBe(0);
  });
});

describe('tabBarLogic — shouldDispatchNavigation', () => {
  test('returns_false_when_current_equals_target', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 1,
        targetIndex: 1,
        defaultPrevented: false,
        tabCount: 4,
      }),
    ).toBe(false);
  });

  test('returns_true_when_target_differs_and_in_range_and_not_prevented', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 0,
        targetIndex: 2,
        defaultPrevented: false,
        tabCount: 4,
      }),
    ).toBe(true);
  });

  test('returns_false_when_default_prevented', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 0,
        targetIndex: 2,
        defaultPrevented: true,
        tabCount: 4,
      }),
    ).toBe(false);
  });

  test('returns_false_when_targetIndex_negative', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 0,
        targetIndex: -1,
        defaultPrevented: false,
        tabCount: 4,
      }),
    ).toBe(false);
  });

  test('returns_false_when_targetIndex_at_or_above_tabCount', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 0,
        targetIndex: 4,
        defaultPrevented: false,
        tabCount: 4,
      }),
    ).toBe(false);
  });

  test('returns_false_when_tabCount_is_zero', () => {
    expect(
      shouldDispatchNavigation({
        currentIndex: 0,
        targetIndex: 0,
        defaultPrevented: false,
        tabCount: 0,
      }),
    ).toBe(false);
  });
});
