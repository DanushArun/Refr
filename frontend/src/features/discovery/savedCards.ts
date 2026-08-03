import AsyncStorage from '@react-native-async-storage/async-storage';

export type DiscoveryRole = 'endorser' | 'seeker';

export interface SavedDiscoveryCard {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  path: string;
}

function storageKey(role: DiscoveryRole): string {
  return `endorsly_saved_cards_${role}`;
}

export function saveCard(
  cards: SavedDiscoveryCard[],
  card: SavedDiscoveryCard,
): SavedDiscoveryCard[] {
  return [card, ...cards.filter((saved) => saved.id !== card.id)];
}

export function removeCard(
  cards: SavedDiscoveryCard[],
  id: string,
): SavedDiscoveryCard[] {
  return cards.filter((card) => card.id !== id);
}

export async function loadSavedCards(role: DiscoveryRole): Promise<SavedDiscoveryCard[]> {
  const value = await AsyncStorage.getItem(storageKey(role));
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isSavedCard);
}

export async function persistSavedCard(
  role: DiscoveryRole,
  card: SavedDiscoveryCard,
): Promise<SavedDiscoveryCard[]> {
  const saved = saveCard(await loadSavedCards(role), card);
  await AsyncStorage.setItem(storageKey(role), JSON.stringify(saved));
  return saved;
}

export async function removeSavedCard(
  role: DiscoveryRole,
  id: string,
): Promise<SavedDiscoveryCard[]> {
  const saved = removeCard(await loadSavedCards(role), id);
  await AsyncStorage.setItem(storageKey(role), JSON.stringify(saved));
  return saved;
}

function isSavedCard(value: unknown): value is SavedDiscoveryCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;
  return ['id', 'title', 'subtitle', 'detail', 'path'].every(
    (key) => typeof card[key] === 'string',
  );
}
