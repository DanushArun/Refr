import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../shared/auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.js';
import { ChatService } from './chat.service.js';
import type { AuthenticatedRequest } from '../../shared/auth/auth.types.js';

export const chatRouter = Router();

// GET /api/v1/chat/:referralId
// Returns the conversation + message history for a referral
chatRouter.get(
  '/:referralId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const conversation = await ChatService.getConversation(req.params.referralId, userId);
      res.json({ data: conversation });
    } catch (err) {
      next(err);
    }
  },
);

const messagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

// GET /api/v1/chat/:referralId/messages?cursor=xxx&limit=30
chatRouter.get(
  '/:referralId/messages',
  requireAuth,
  validate(messagesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const conv = await ChatService.getConversation(req.params.referralId, userId);
      const query = req.query as z.infer<typeof messagesQuerySchema>;
      const result = await ChatService.getMessages(conv.id, userId, query.cursor, query.limit);
      res.json({ data: result.messages, meta: { cursor: result.cursor, hasMore: result.hasMore } });
    } catch (err) {
      next(err);
    }
  },
);

const sendMessageSchema = z.object({ body: z.string().min(1).max(4000) });

// POST /api/v1/chat/:conversationId/messages
chatRouter.post(
  '/:conversationId/messages',
  requireAuth,
  validate(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { body } = req.body as z.infer<typeof sendMessageSchema>;
      const message = await ChatService.sendMessage(req.params.conversationId, userId, body);
      res.status(201).json({ data: message });
    } catch (err) {
      next(err);
    }
  },
);
