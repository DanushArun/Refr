import { prisma } from '../../lib/prisma.js';

// ─── Kingmaker Score constants ─────────────────────────────────────────────
// Score is a 0-100 integer representing a referrer's impact.
// It is earned permanently — successful hires add points that never decay.
// Weekly decay (-1/week) applies when a referrer has been inactive for 2+ weeks
// to maintain leaderboard dynamism. This is a scheduled job (not per-request).

const SCORE_PER_HIRE = 10;
const SCORE_PER_REFERRAL = 2;
const SCORE_DECAY_PER_WEEK = 1;
const INACTIVE_THRESHOLD_DAYS = 14;

export const ReputationService = {
  // Fetch public Kingmaker profile for a referrer
  async getKingmakerProfile(userId: string) {
    return prisma.referrerProfile.findUniqueOrThrow({
      where: { userId },
      select: {
        kingmakerScore: true,
        totalReferrals: true,
        successfulHires: true,
        department: true,
        jobTitle: true,
        user: { select: { displayName: true, avatarUrl: true } },
        company: { select: { name: true, logoUrl: true } },
      },
    });
  },

  // Global leaderboard — top 50 referrers sorted by Kingmaker Score
  async getLeaderboard(companyId?: string) {
    return prisma.referrerProfile.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { kingmakerScore: 'desc' },
      take: 50,
      select: {
        kingmakerScore: true,
        totalReferrals: true,
        successfulHires: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        company: { select: { name: true, logoUrl: true } },
      },
    });
  },

  // Apply weekly decay to inactive referrers
  // Called by a BullMQ scheduled job — NOT on every request
  async applyWeeklyDecay() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INACTIVE_THRESHOLD_DAYS);

    // Referrers who haven't submitted a referral in 2+ weeks
    const inactiveReferrers = await prisma.referrerProfile.findMany({
      where: {
        kingmakerScore: { gt: 0 },
        referrals: {
          none: { requestedAt: { gte: cutoff } },
        },
      },
      select: { id: true, kingmakerScore: true },
    });

    const updates = inactiveReferrers.map((r) =>
      prisma.referrerProfile.update({
        where: { id: r.id },
        data: { kingmakerScore: Math.max(0, r.kingmakerScore - SCORE_DECAY_PER_WEEK) },
      }),
    );

    await prisma.$transaction(updates);
    return { decayed: updates.length };
  },

  // Increment score when a referral is submitted (not yet hired)
  async onReferralSubmitted(referrerId: string) {
    await prisma.referrerProfile.update({
      where: { id: referrerId },
      data: {
        totalReferrals: { increment: 1 },
        kingmakerScore: { increment: SCORE_PER_REFERRAL },
      },
    });
  },

  // Large increment when a hire is confirmed
  async onHireConfirmed(referrerId: string) {
    await prisma.referrerProfile.update({
      where: { id: referrerId },
      data: {
        successfulHires: { increment: 1 },
        kingmakerScore: { increment: SCORE_PER_HIRE },
      },
    });
  },
};

export { SCORE_PER_HIRE, SCORE_PER_REFERRAL, SCORE_DECAY_PER_WEEK, INACTIVE_THRESHOLD_DAYS };
