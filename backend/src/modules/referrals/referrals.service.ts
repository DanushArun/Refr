import type { ReferralStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { assertTransition, TRANSITION_TIMESTAMP } from './referrals.state-machine.js';

export const ReferralsService = {
  // Create a new referral request triggered from a feed card
  async createRequest(params: {
    seekerId: string;
    referrerId: string;
    companyId: string;
    targetRole: string;
    seekerNote?: string;
    feedCardId?: string;
  }) {
    // Resolve seeker profile id from user id
    const seekerProfile = await prisma.seekerProfile.findUniqueOrThrow({
      where: { userId: params.seekerId },
      select: { id: true },
    });

    const referrerProfile = await prisma.referrerProfile.findUniqueOrThrow({
      where: { userId: params.referrerId },
      select: { id: true, kingmakerScore: true },
    });

    // Compute a simple match score (Phase 1: random 60-90 for accepted referrers)
    // Phase 3: replace with embedding similarity
    const matchScore = Math.floor(Math.random() * 30) + 60;

    const referral = await prisma.referral.create({
      data: {
        seekerId: seekerProfile.id,
        referrerId: referrerProfile.id,
        companyId: params.companyId,
        targetRole: params.targetRole,
        seekerNote: params.seekerNote,
        feedCardId: params.feedCardId,
        matchScore,
      },
      include: { company: true, seeker: { include: { user: true } } },
    });

    // Auto-create a conversation for this referral
    await prisma.conversation.create({ data: { referralId: referral.id } });

    return referral;
  },

  // Referrer's inbox — all referrals waiting on them
  async getReferrerInbox(userId: string) {
    const profile = await prisma.referrerProfile.findUniqueOrThrow({
      where: { userId },
      select: { id: true },
    });

    return prisma.referral.findMany({
      where: { referrerId: profile.id, status: { in: ['requested', 'accepted', 'submitted', 'interviewing'] } },
      include: {
        seeker: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        company: { select: { name: true, logoUrl: true } },
        conversation: { select: { id: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  },

  // Seeker's pipeline — all their referrals
  async getSeekerPipeline(userId: string) {
    const profile = await prisma.seekerProfile.findUniqueOrThrow({
      where: { userId },
      select: { id: true },
    });

    return prisma.referral.findMany({
      where: { seekerId: profile.id },
      include: {
        referrer: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        company: { select: { name: true, logoUrl: true } },
        conversation: { select: { id: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  },

  // Advance referral through the state machine
  async transition(referralId: string, userId: string, toStatus: ReferralStatus, note?: string) {
    const referral = await prisma.referral.findUniqueOrThrow({
      where: { id: referralId },
      include: {
        seeker: { include: { user: true } },
        referrer: { include: { user: true } },
      },
    });

    assertTransition(referral.status, toStatus);

    const timestampField = TRANSITION_TIMESTAMP[toStatus];
    const timestampUpdate = timestampField ? { [timestampField]: new Date() } : {};

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: toStatus,
        referrerNote: note ?? referral.referrerNote,
        ...timestampUpdate,
      },
    });

    // On hire: increment successfulHires + Kingmaker Score
    if (toStatus === 'hired') {
      await prisma.referrerProfile.update({
        where: { id: referral.referrerId },
        data: {
          successfulHires: { increment: 1 },
          kingmakerScore: { increment: 10 },
        },
      });

      // Emit a milestone content card so the hire shows up in the feed
      await prisma.contentCard.create({
        data: {
          type: 'milestone',
          companyId: referral.companyId,
          payload: {
            referralId: referral.id,
            referrerId: referral.referrerId,
            headline: 'A referral resulted in a hire!',
          },
        },
      });
    }

    return updated;
  },
};
