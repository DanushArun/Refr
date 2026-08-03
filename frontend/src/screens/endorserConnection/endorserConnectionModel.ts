export const endorserConnectionStates = ['message', 'sent'] as const;

export type EndorserConnectionState = (typeof endorserConnectionStates)[number];

export function nextEndorserConnectionRoute(state: EndorserConnectionState): string {
  return state === 'message'
    ? '/candidate/priya-nair/connect/sent'
    : '/connection/priya-nair';
}
