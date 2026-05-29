/**
 * Pure reducer + selectors for the referrer's incoming-request queue.
 *
 * Powers the Endorser inbox: shows pending requests from seekers, supports
 * optimistic accept/pass with rollback on failure. UI screen is a thin
 * dispatch wrapper around this state machine.
 */

export interface InboxItem {
  id: string;
  status: 'requested' | 'accepted' | 'submitted' | 'interviewing';
  seekerId: string;
}

export type Decision = 'accept' | 'pass';

export interface InboxState {
  items: InboxItem[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  /** id -> in-flight decision; presence means optimistic UI is active */
  pending: Record<string, Decision>;
}

export type InboxAction =
  | { type: 'FETCH_STARTED' }
  | { type: 'FETCH_SUCCEEDED'; items: InboxItem[] }
  | { type: 'FETCH_FAILED'; error: string }
  | { type: 'DECISION_STARTED'; itemId: string; decision: Decision }
  | { type: 'DECISION_SUCCEEDED'; itemId: string }
  | { type: 'DECISION_FAILED'; itemId: string }
  | { type: 'RESET' };

export const initialInboxState: InboxState = {
  items: [],
  status: 'idle',
  error: null,
  pending: {},
};

export function inboxReducer(state: InboxState, action: InboxAction): InboxState {
  switch (action.type) {
    case 'FETCH_STARTED':
      return { ...state, status: 'loading', error: null };

    case 'FETCH_SUCCEEDED':
      return { ...state, items: action.items, status: 'ready', error: null, pending: {} };

    case 'FETCH_FAILED':
      return { ...state, status: 'error', error: action.error };

    case 'DECISION_STARTED':
      return { ...state, pending: { ...state.pending, [action.itemId]: action.decision } };

    case 'DECISION_SUCCEEDED': {
      const { [action.itemId]: _gone, ...rest } = state.pending;
      return {
        ...state,
        items: state.items.filter((x) => x.id !== action.itemId),
        pending: rest,
      };
    }

    case 'DECISION_FAILED': {
      const { [action.itemId]: _rolledBack, ...rest } = state.pending;
      return { ...state, pending: rest };
    }

    case 'RESET':
      return initialInboxState;

    default:
      return assertNever(action);
  }
}

export function selectTopItem(state: InboxState): InboxItem | null {
  return state.items[0] ?? null;
}

export function selectActiveItems(state: InboxState): InboxItem[] {
  return state.items.filter((x) => state.pending[x.id] === undefined);
}

export function selectPendingDecisionCount(state: InboxState): number {
  return Object.keys(state.pending).length;
}

function assertNever(x: never): never {
  throw new Error(`Unhandled inbox action: ${JSON.stringify(x)}`);
}
