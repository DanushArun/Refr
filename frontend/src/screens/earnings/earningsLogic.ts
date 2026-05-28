export function formatINR(amount: number): string {
  if (amount === 0) return '₹0';
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function estimateInFlight(totalEndorsements: number, successfulHires: number): number {
  return Math.max(0, totalEndorsements - successfulHires);
}

export function calculatePayoutAmount(successfulHires: number, payoutPerHire: number): number {
  return successfulHires * payoutPerHire;
}

export function calculateRankPosition(
  viewerName: string,
  leaderboard: { user: { displayName: string } }[],
): number {
  return leaderboard.findIndex((entry) => entry.user.displayName === viewerName) + 1;
}
