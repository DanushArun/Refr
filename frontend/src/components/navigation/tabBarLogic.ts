export type SlotIndexInput = {
  fingerX: number;
  tabWidth: number;
  tabCount: number;
  innerPadding: number;
};

export type DispatchInput = {
  currentIndex: number;
  targetIndex: number;
  defaultPrevented: boolean;
  tabCount: number;
};

export function clampSlotIndex(index: number, tabCount: number): number {
  if (tabCount <= 0) return 0;
  if (index < 0) return 0;
  if (index > tabCount - 1) return tabCount - 1;
  return index;
}

export function indicatorXForIndex(index: number, tabWidth: number): number {
  const safeIndex = index < 0 ? 0 : index;
  return safeIndex * tabWidth;
}

export function slotIndexForFingerX(input: SlotIndexInput): number {
  const { fingerX, tabWidth, tabCount, innerPadding } = input;
  if (tabCount <= 0 || tabWidth <= 0) return 0;
  const local = fingerX - innerPadding;
  const raw = Math.floor(local / tabWidth);
  return clampSlotIndex(raw, tabCount);
}

export function shouldDispatchNavigation(input: DispatchInput): boolean {
  const { currentIndex, targetIndex, defaultPrevented, tabCount } = input;
  if (tabCount <= 0) return false;
  if (defaultPrevented) return false;
  if (targetIndex < 0 || targetIndex >= tabCount) return false;
  if (targetIndex === currentIndex) return false;
  return true;
}
