import {
  type InboxItem,
  type InboxState,
  inboxReducer,
  initialInboxState,
  selectActiveItems,
  selectPendingDecisionCount,
  selectTopItem,
} from './inboxQueue';

const item = (id: string, status: InboxItem['status'] = 'requested'): InboxItem => ({
  id,
  status,
  seekerId: `s-${id}`,
});

const ready = (...items: InboxItem[]): InboxState =>
  inboxReducer(initialInboxState, { type: 'FETCH_SUCCEEDED', items });

describe('inboxQueue — initial state', () => {
  test('starts_idle_with_empty_items', () => {
    expect(initialInboxState).toEqual({
      items: [],
      status: 'idle',
      error: null,
      pending: {},
    });
  });
});

describe('inboxQueue — FETCH_STARTED', () => {
  test('sets_status_loading_and_clears_error', () => {
    const errored = inboxReducer(initialInboxState, { type: 'FETCH_FAILED', error: 'x' });
    const next = inboxReducer(errored, { type: 'FETCH_STARTED' });
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  test('preserves_existing_items_for_stale_while_revalidate', () => {
    const seeded = ready(item('a'), item('b'));
    const next = inboxReducer(seeded, { type: 'FETCH_STARTED' });
    expect(next.items).toEqual(seeded.items);
  });
});

describe('inboxQueue — FETCH_SUCCEEDED', () => {
  test('replaces_items_and_sets_status_ready', () => {
    const next = ready(item('a'), item('b'));
    expect(next.items.map((x) => x.id)).toEqual(['a', 'b']);
    expect(next.status).toBe('ready');
  });

  test('clears_pending_decisions', () => {
    const seeded = inboxReducer(ready(item('a')), {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'accept',
    });
    expect(seeded.pending.a).toBe('accept');
    const refreshed = inboxReducer(seeded, { type: 'FETCH_SUCCEEDED', items: [item('a')] });
    expect(refreshed.pending).toEqual({});
  });
});

describe('inboxQueue — FETCH_FAILED', () => {
  test('records_error_and_keeps_items_visible', () => {
    const seeded = ready(item('a'));
    const next = inboxReducer(seeded, { type: 'FETCH_FAILED', error: 'network' });
    expect(next.status).toBe('error');
    expect(next.error).toBe('network');
    expect(next.items).toEqual(seeded.items);
  });
});

describe('inboxQueue — DECISION_STARTED (optimistic)', () => {
  test('records_decision_in_pending_map', () => {
    const seeded = ready(item('a'));
    const next = inboxReducer(seeded, {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'accept',
    });
    expect(next.pending.a).toBe('accept');
  });

  test('does_not_remove_item_until_decision_succeeds', () => {
    const seeded = ready(item('a'));
    const next = inboxReducer(seeded, {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'pass',
    });
    expect(next.items.find((x) => x.id === 'a')).toBeDefined();
  });
});

describe('inboxQueue — DECISION_SUCCEEDED', () => {
  test('removes_item_from_queue_and_clears_pending', () => {
    const seeded = inboxReducer(ready(item('a'), item('b')), {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'accept',
    });
    const next = inboxReducer(seeded, { type: 'DECISION_SUCCEEDED', itemId: 'a' });
    expect(next.items.map((x) => x.id)).toEqual(['b']);
    expect(next.pending.a).toBeUndefined();
  });
});

describe('inboxQueue — DECISION_FAILED (rollback)', () => {
  test('removes_pending_marker_and_keeps_item_in_queue', () => {
    const seeded = inboxReducer(ready(item('a'), item('b')), {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'accept',
    });
    const next = inboxReducer(seeded, { type: 'DECISION_FAILED', itemId: 'a' });
    expect(next.pending.a).toBeUndefined();
    expect(next.items.find((x) => x.id === 'a')).toBeDefined();
  });
});

describe('inboxQueue — RESET', () => {
  test('returns_to_initial_state', () => {
    const seeded = ready(item('a'), item('b'));
    expect(inboxReducer(seeded, { type: 'RESET' })).toEqual(initialInboxState);
  });
});

describe('inboxQueue — selectors', () => {
  test('selectTopItem_returns_first_item_or_null', () => {
    expect(selectTopItem(initialInboxState)).toBeNull();
    expect(selectTopItem(ready(item('a'), item('b')))?.id).toBe('a');
  });

  test('selectActiveItems_excludes_pending_decisions', () => {
    const state = inboxReducer(ready(item('a'), item('b'), item('c')), {
      type: 'DECISION_STARTED',
      itemId: 'b',
      decision: 'pass',
    });
    expect(selectActiveItems(state).map((x) => x.id)).toEqual(['a', 'c']);
  });

  test('selectPendingDecisionCount_counts_optimistic_pending', () => {
    const state = inboxReducer(ready(item('a'), item('b')), {
      type: 'DECISION_STARTED',
      itemId: 'a',
      decision: 'accept',
    });
    expect(selectPendingDecisionCount(state)).toBe(1);
  });
});
