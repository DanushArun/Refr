let counter = 0;
const UID_SEED = Math.random().toString(36).slice(2, 10);

export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${UID_SEED}-${counter}`;
}
