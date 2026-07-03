import { spacing } from '../../theme/spacing';

interface ActivePillMetrics {
  left: number;
  width: number;
}

export function activePillMetrics(
  index: number,
  routeCount: number,
  rowWidth: number,
): ActivePillMetrics | null {
  if (rowWidth <= 0 || routeCount <= 0) return null;

  const rowPadding = spacing[3];
  const edgeReserve = spacing[2];
  const availableWidth = rowWidth - rowPadding * 2;
  const cellWidth = availableWidth / routeCount;
  const pillWidth = Math.min(cellWidth + spacing[4], availableWidth);
  const centeredLeft = rowPadding + index * cellWidth + (cellWidth - pillWidth) / 2;
  const minLeft = rowPadding - edgeReserve;
  const maxLeft = rowWidth - rowPadding + edgeReserve - pillWidth;
  const left = Math.min(Math.max(centeredLeft, minLeft), maxLeft);

  return { left, width: pillWidth };
}
