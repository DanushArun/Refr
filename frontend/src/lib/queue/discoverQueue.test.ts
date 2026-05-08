// Pure-logic tests for the discoverQueue reducer — the state machine behind the
// seeker's Discover swipe deck. No React, no native deps, no async. Tests describe
// observable state transitions only — they must survive any internal refactor.

import {
  DiscoverAction,
  DiscoverState,
  QueueCard,
  discoverReducer,
  initialState,
  selectIsExhausted,
  selectRemainingCount,
  selectStackPreview,
  selectTopCard,
} from './discoverQueue';

const card = (id: string): QueueCard => ({ id });

const cards = (...ids: string[]): QueueCard[] => ids.map(card);

const reduce = (
  state: DiscoverState,
  ...actions: DiscoverAction[]
): DiscoverState => actions.reduce(discoverReducer, state);

describe('discoverReducer — initialState', () => {
  it('starts_with_empty_cards_array', (): void => {
    expect(initialState.cards).toEqual([]);
  });

  it('starts_with_index_at_zero', (): void => {
    expect(initialState.index).toBe(0);
  });

  it('starts_with_status_idle', (): void => {
    expect(initialState.status).toBe('idle');
  });

  it('starts_with_no_error', (): void => {
    expect(initialState.error).toBeNull();
  });

  it('starts_with_filter_set_to_all', (): void => {
    expect(initialState.filter).toBe('All');
  });

  it('starts_with_empty_swiped_ids_map', (): void => {
    expect(initialState.swipedIds).toEqual({});
  });
});

describe('discoverReducer — FETCH_STARTED', () => {
  it('sets_status_to_loading_when_fetch_starts', (): void => {
    const next = discoverReducer(initialState, { type: 'FETCH_STARTED' });

    expect(next.status).toBe('loading');
  });

  it('clears_previous_error_when_fetch_starts', (): void => {
    const errored: DiscoverState = {
      ...initialState,
      status: 'error',
      error: 'network down',
    };

    const next = discoverReducer(errored, { type: 'FETCH_STARTED' });

    expect(next.error).toBeNull();
  });

  it('preserves_existing_cards_during_loading_for_stale_while_revalidate', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      status: 'ready',
    };

    const next = discoverReducer(populated, { type: 'FETCH_STARTED' });

    expect(next.cards).toEqual(cards('r-1', 'r-2'));
  });

  it('preserves_existing_index_during_loading', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 1,
      status: 'ready',
    };

    const next = discoverReducer(populated, { type: 'FETCH_STARTED' });

    expect(next.index).toBe(1);
  });
});

describe('discoverReducer — FETCH_SUCCEEDED replace mode', () => {
  it('replaces_cards_with_the_new_payload', (): void => {
    const stale: DiscoverState = {
      ...initialState,
      cards: cards('old-1', 'old-2'),
      status: 'loading',
    };

    const next = discoverReducer(stale, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-1', 'r-2', 'r-3'),
      mode: 'replace',
    });

    expect(next.cards).toEqual(cards('r-1', 'r-2', 'r-3'));
  });

  it('resets_index_to_zero_on_replace', (): void => {
    const advanced: DiscoverState = {
      ...initialState,
      cards: cards('old-1', 'old-2'),
      index: 2,
      status: 'loading',
    };

    const next = discoverReducer(advanced, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-1', 'r-2'),
      mode: 'replace',
    });

    expect(next.index).toBe(0);
  });

  it('moves_status_to_ready_after_replace', (): void => {
    const next = discoverReducer(
      { ...initialState, status: 'loading' },
      { type: 'FETCH_SUCCEEDED', cards: cards('r-1'), mode: 'replace' },
    );

    expect(next.status).toBe('ready');
  });

  it('clears_swiped_ids_when_queue_replaced', (): void => {
    const dirty: DiscoverState = {
      ...initialState,
      swipedIds: { 'old-1': 'request', 'old-2': 'pass' },
      status: 'loading',
    };

    const next = discoverReducer(dirty, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-1', 'r-2'),
      mode: 'replace',
    });

    expect(next.swipedIds).toEqual({});
  });

  it('clears_error_after_replace', (): void => {
    const errored: DiscoverState = {
      ...initialState,
      error: 'old failure',
      status: 'loading',
    };

    const next = discoverReducer(errored, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-1'),
      mode: 'replace',
    });

    expect(next.error).toBeNull();
  });
});

describe('discoverReducer — FETCH_SUCCEEDED append mode', () => {
  it('appends_new_cards_to_existing_queue', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      status: 'ready',
    };

    const next = discoverReducer(populated, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-3', 'r-4'),
      mode: 'append',
    });

    expect(next.cards).toEqual(cards('r-1', 'r-2', 'r-3', 'r-4'));
  });

  it('dedupes_appended_cards_against_existing_queue_by_id', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      status: 'ready',
    };

    const next = discoverReducer(populated, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-2', 'r-3', 'r-4', 'r-5'),
      mode: 'append',
    });

    expect(next.cards).toEqual(cards('r-1', 'r-2', 'r-3', 'r-4', 'r-5'));
  });

  it('preserves_index_on_append', (): void => {
    const advanced: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 2,
      status: 'ready',
    };

    const next = discoverReducer(advanced, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-4', 'r-5'),
      mode: 'append',
    });

    expect(next.index).toBe(2);
  });

  it('preserves_swiped_ids_on_append', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 2,
      status: 'ready',
      swipedIds: { 'r-1': 'request', 'r-2': 'pass' },
    };

    const next = discoverReducer(populated, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-3'),
      mode: 'append',
    });

    expect(next.swipedIds).toEqual({ 'r-1': 'request', 'r-2': 'pass' });
  });

  it('moves_status_to_ready_after_append', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1'),
      status: 'loading',
    };

    const next = discoverReducer(populated, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-2'),
      mode: 'append',
    });

    expect(next.status).toBe('ready');
  });

  it('clears_error_after_append', (): void => {
    const errored: DiscoverState = {
      ...initialState,
      cards: cards('r-1'),
      error: 'transient error',
      status: 'loading',
    };

    const next = discoverReducer(errored, {
      type: 'FETCH_SUCCEEDED',
      cards: cards('r-2'),
      mode: 'append',
    });

    expect(next.error).toBeNull();
  });
});

describe('discoverReducer — FETCH_FAILED', () => {
  it('sets_status_to_error_when_fetch_fails', (): void => {
    const loading: DiscoverState = { ...initialState, status: 'loading' };

    const next = discoverReducer(loading, {
      type: 'FETCH_FAILED',
      error: 'request timed out',
    });

    expect(next.status).toBe('error');
  });

  it('records_provided_error_message', (): void => {
    const next = discoverReducer(initialState, {
      type: 'FETCH_FAILED',
      error: 'request timed out',
    });

    expect(next.error).toBe('request timed out');
  });

  it('keeps_existing_cards_visible_when_fetch_fails', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      status: 'loading',
    };

    const next = discoverReducer(populated, {
      type: 'FETCH_FAILED',
      error: 'network down',
    });

    expect(next.cards).toEqual(cards('r-1', 'r-2'));
  });
});

describe('discoverReducer — SWIPED', () => {
  it('advances_index_by_one_when_top_card_is_swiped', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 0,
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-1',
      direction: 'request',
    });

    expect(next.index).toBe(1);
  });

  it('records_swipe_direction_for_request', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-1',
      direction: 'request',
    });

    expect(next.swipedIds).toEqual({ 'r-1': 'request' });
  });

  it('records_swipe_direction_for_pass', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1'),
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-1',
      direction: 'pass',
    });

    expect(next.swipedIds).toEqual({ 'r-1': 'pass' });
  });

  it('moves_status_to_exhausted_when_last_card_is_swiped', (): void => {
    const lastCard: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 1,
      status: 'ready',
    };

    const next = discoverReducer(lastCard, {
      type: 'SWIPED',
      cardId: 'r-2',
      direction: 'pass',
    });

    expect(next.status).toBe('exhausted');
  });

  it('keeps_status_ready_when_more_cards_remain_after_swipe', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 0,
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-1',
      direction: 'pass',
    });

    expect(next.status).toBe('ready');
  });

  it('is_a_noop_when_swiped_card_is_not_at_current_index', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 0,
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-3',
      direction: 'pass',
    });

    expect(next).toBe(ready);
  });

  it('does_not_record_swipe_for_out_of_order_card', (): void => {
    const ready: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 0,
      status: 'ready',
    };

    const next = discoverReducer(ready, {
      type: 'SWIPED',
      cardId: 'r-2',
      direction: 'request',
    });

    expect(next.swipedIds).toEqual({});
  });
});

describe('discoverReducer — FILTER_CHANGED', () => {
  it('updates_filter_to_provided_value', (): void => {
    const next = discoverReducer(initialState, {
      type: 'FILTER_CHANGED',
      filter: 'Razorpay',
    });

    expect(next.filter).toBe('Razorpay');
  });

  it('does_not_touch_cards_when_filter_changes', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 1,
      status: 'ready',
      swipedIds: { 'r-1': 'request' },
    };

    const next = discoverReducer(populated, {
      type: 'FILTER_CHANGED',
      filter: 'Zepto',
    });

    expect(next.cards).toEqual(cards('r-1', 'r-2'));
  });

  it('does_not_touch_index_when_filter_changes', (): void => {
    const populated: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 1,
      status: 'ready',
    };

    const next = discoverReducer(populated, {
      type: 'FILTER_CHANGED',
      filter: 'Zepto',
    });

    expect(next.index).toBe(1);
  });

  it('does_not_touch_swiped_ids_when_filter_changes', (): void => {
    const dirty: DiscoverState = {
      ...initialState,
      swipedIds: { 'r-1': 'request' },
    };

    const next = discoverReducer(dirty, {
      type: 'FILTER_CHANGED',
      filter: 'Google',
    });

    expect(next.swipedIds).toEqual({ 'r-1': 'request' });
  });
});

describe('discoverReducer — RESET', () => {
  it('returns_to_initial_state_from_any_populated_state', (): void => {
    const dirty: DiscoverState = {
      cards: cards('r-1', 'r-2'),
      index: 2,
      status: 'exhausted',
      error: 'something',
      filter: 'Razorpay',
      swipedIds: { 'r-1': 'request', 'r-2': 'pass' },
    };

    const next = discoverReducer(dirty, { type: 'RESET' });

    expect(next).toEqual(initialState);
  });
});

describe('discoverReducer — sequential flows', () => {
  it('produces_exhausted_status_after_full_swipe_through', (): void => {
    const final = reduce(
      initialState,
      { type: 'FETCH_STARTED' },
      { type: 'FETCH_SUCCEEDED', cards: cards('r-1', 'r-2'), mode: 'replace' },
      { type: 'SWIPED', cardId: 'r-1', direction: 'request' },
      { type: 'SWIPED', cardId: 'r-2', direction: 'pass' },
    );

    expect(final.status).toBe('exhausted');
  });

  it('records_both_swipe_decisions_after_full_swipe_through', (): void => {
    const final = reduce(
      initialState,
      { type: 'FETCH_SUCCEEDED', cards: cards('r-1', 'r-2'), mode: 'replace' },
      { type: 'SWIPED', cardId: 'r-1', direction: 'request' },
      { type: 'SWIPED', cardId: 'r-2', direction: 'pass' },
    );

    expect(final.swipedIds).toEqual({ 'r-1': 'request', 'r-2': 'pass' });
  });
});

describe('selectTopCard', () => {
  it('returns_card_at_current_index_when_present', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 1,
    };

    expect(selectTopCard(state)).toEqual(card('r-2'));
  });

  it('returns_null_when_index_is_past_end_of_cards', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1'),
      index: 1,
    };

    expect(selectTopCard(state)).toBeNull();
  });

  it('returns_null_when_cards_array_is_empty', (): void => {
    expect(selectTopCard(initialState)).toBeNull();
  });
});

describe('selectStackPreview', () => {
  it('returns_default_three_cards_behind_top_when_depth_omitted', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3', 'r-4', 'r-5'),
      index: 0,
    };

    expect(selectStackPreview(state)).toEqual(cards('r-2', 'r-3', 'r-4'));
  });

  it('respects_explicit_depth_parameter', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3', 'r-4', 'r-5'),
      index: 0,
    };

    expect(selectStackPreview(state, 2)).toEqual(cards('r-2', 'r-3'));
  });

  it('returns_empty_array_when_no_upcoming_cards_remain', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 1,
    };

    expect(selectStackPreview(state)).toEqual([]);
  });

  it('returns_empty_array_when_cards_array_is_empty', (): void => {
    expect(selectStackPreview(initialState)).toEqual([]);
  });

  it('caps_preview_at_remaining_cards_when_fewer_than_depth_left', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3'),
      index: 0,
    };

    expect(selectStackPreview(state, 5)).toEqual(cards('r-2', 'r-3'));
  });
});

describe('selectRemainingCount', () => {
  it('returns_total_minus_index_when_index_inside_bounds', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2', 'r-3', 'r-4'),
      index: 1,
    };

    expect(selectRemainingCount(state)).toBe(3);
  });

  it('returns_zero_when_index_equals_cards_length', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 2,
    };

    expect(selectRemainingCount(state)).toBe(0);
  });

  it('returns_zero_when_index_exceeds_cards_length', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1'),
      index: 5,
    };

    expect(selectRemainingCount(state)).toBe(0);
  });

  it('returns_zero_when_cards_is_empty', (): void => {
    expect(selectRemainingCount(initialState)).toBe(0);
  });
});

describe('selectIsExhausted', () => {
  it('returns_true_when_index_reaches_end_of_non_empty_queue', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 2,
    };

    expect(selectIsExhausted(state)).toBe(true);
  });

  it('returns_false_when_more_cards_remain', (): void => {
    const state: DiscoverState = {
      ...initialState,
      cards: cards('r-1', 'r-2'),
      index: 0,
    };

    expect(selectIsExhausted(state)).toBe(false);
  });

  it('returns_false_for_empty_queue_to_distinguish_idle_from_exhausted', (): void => {
    expect(selectIsExhausted(initialState)).toBe(false);
  });
});
