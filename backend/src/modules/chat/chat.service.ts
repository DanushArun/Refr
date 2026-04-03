import { prisma } from '../../lib/prisma.js';

export const ChatService = {
  // Get conversation for a referral, verifying the requesting user is a party
  async getConversation(referralId: string, userId: string) {
    const conversation = await prisma.conversation.findUniqueOrThrow({
      where: { referralId },
      include: {
        referral: {
          include: {
            seeker: { include: { user: { select: { id: true } } } },
            referrer: { include: { user: { select: { id: true } } } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
        },
      },
    });

    const { seeker, referrer } = conversation.referral;
    const isParty = seeker.user.id === userId || referrer.user.id === userId;
    if (!isParty) throw new Error('Forbidden');

    return conversation;
  },

  // Send a message — Supabase Realtime broadcasts to both parties automatically
  async sendMessage(conversationId: string, senderId: string, body: string) {
    // Verify sender is a party to the conversation
    const conversation = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: {
        referral: {
          include: {
            seeker: { include: { user: { select: { id: true } } } },
            referrer: { include: { user: { select: { id: true } } } },
          },
        },
      },
    });

    const { seeker, referrer } = conversation.referral;
    const isParty = seeker.user.id === senderId || referrer.user.id === senderId;
    if (!isParty) throw new Error('Forbidden');

    return prisma.message.create({
      data: { conversationId, senderId, body },
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
    });
  },

  // Paginated message history (before a cursor)
  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 30) {
    const conversation = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: {
        referral: {
          include: {
            seeker: { include: { user: { select: { id: true } } } },
            referrer: { include: { user: { select: { id: true } } } },
          },
        },
      },
    });

    const { seeker, referrer } = conversation.referral;
    const isParty = seeker.user.id === userId || referrer.user.id === userId;
    if (!isParty) throw new Error('Forbidden');

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
    });

    const hasMore = messages.length > limit;
    const page = messages.slice(0, limit).reverse();

    return {
      messages: page,
      cursor: page[0]?.createdAt.toISOString() ?? null,
      hasMore,
    };
  },
};
