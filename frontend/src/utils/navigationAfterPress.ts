import { Phrase } from './haptics';

const NAVIGATION_LOCK_MS = 420;

let navigationLocked = false;

export function navigateAfterPress(action: () => void): void {
  if (navigationLocked) return;
  navigationLocked = true;
  void Phrase.tap();
  runNavigation(action);
}

function runNavigation(action: () => void): void {
  try {
    action();
    setTimeout(unlockNavigation, NAVIGATION_LOCK_MS);
  } catch (error) {
    unlockNavigation();
    throw error;
  }
}

function unlockNavigation(): void {
  navigationLocked = false;
}
