// Pure-logic state machine for the seeker's Discover swipe deck.
// No React, no I/O, no side effects. Same input, same output — every transition
// is observable from state alone, so the UI can be swapped without touching this module.

export interface QueueCard {
  id: string;
}

export type SwipeDirection = 'request' | 'pass';

export type DiscoverStatus = 'idle' | 'loading' | 'ready' | 'error' | 'exhausted';

export interface DiscoverState {
  cards: QueueCard[];
  index: number;
  status: DiscoverStatus;
  error: string | null;
  filter: string;
  swipedIds: Record<string, SwipeDirection>;
}

export type FetchMode = 'replace' | 'append';

export type DiscoverAction =
  | { type: 'FETCH_STARTED' }
  | { type: 'FETCH_SUCCEEDED'; cards: QueueCard[]; mode: FetchMode }
  | { type: 'FETCH_FAILED'; error: string }
  | { type: 'SWIPED'; cardId: string; direction: SwipeDirection }
  | { type: 'FILTER_CHANGED'; filter: string }
  | { type: 'RESET' };

export const initialState: DiscoverState = {
  cards: [],
  index: 0,
  status: 'idle',
  error: null,
  filter: 'All',
  swipedIds: {},
};

function assertNever(action: never): never {
  throw new Error(`Unhandled discover action: ${JSON.stringify(action)}`);
}

function applyFetchSucceeded(
  state: DiscoverState,
  cards: QueueCard[],
  mode: FetchMode,
): DiscoverState {
  if (mode === 'replace') {
    return { ...state, cards, index: 0, status: 'ready', error: null, swipedIds: {} };
  }
  const existingIds = new Set(state.cards.map((c) => c.id));
  const newCards = cards.filter((c) => !existingIds.has(c.id));
  return {
    ...state,
    cards: [...state.cards, ...newCards],
    status: 'ready',
    error: null,
  };
}

function applySwiped(
  state: DiscoverState,
  cardId: string,
  direction: SwipeDirection,
): DiscoverState {
  if (state.cards[state.index]?.id !== cardId) {
    return state;
  }
  const nextIndex = state.index + 1;
  const nextStatus: DiscoverStatus = nextIndex >= state.cards.length ? 'exhausted' : 'ready';
  return {
    ...state,
    index: nextIndex,
    status: nextStatus,
    swipedIds: { ...state.swipedIds, [cardId]: direction },
  };
}

export function discoverReducer(state: DiscoverState, action: DiscoverAction): DiscoverState {
  switch (action.type) {
    case 'FETCH_STARTED':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCEEDED':
      return applyFetchSucceeded(state, action.cards, action.mode);
    case 'FETCH_FAILED':
      return { ...state, status: 'error', error: action.error };
    case 'SWIPED':
      return applySwiped(state, action.cardId, action.direction);
    case 'FILTER_CHANGED':
      return { ...state, filter: action.filter };
    case 'RESET':
      return initialState;
    default:
      return assertNever(action);
  }
}

export function selectTopCard(state: DiscoverState): QueueCard | null {
  return state.cards[state.index] ?? null;
}

export function selectStackPreview(state: DiscoverState, depth = 3): QueueCard[] {
  const start = state.index + 1;
  return state.cards.slice(start, start + depth);
}

export function selectRemainingCount(state: DiscoverState): number {
  return Math.max(0, state.cards.length - state.index);
}

export function selectIsExhausted(state: DiscoverState): boolean {
  return state.cards.length > 0 && state.index >= state.cards.length;
}
