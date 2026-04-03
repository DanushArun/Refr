import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './shared/middleware/logger.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { usersRouter } from './modules/users/users.router.js';
import { feedRouter } from './modules/feed/feed.router.js';
import { contentRouter } from './modules/content/content.router.js';
import { referralsRouter } from './modules/referrals/referrals.router.js';
import { chatRouter } from './modules/chat/chat.router.js';
import { reputationRouter } from './modules/reputation/reputation.router.js';

export function createApp() {
  const app = express();

  // ─── Security & parsing ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:8081'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type'],
    }),
  );
  app.use(express.json({ limit: '512kb' }));
  app.use(pinoHttp({ logger }));

  // ─── Health ────────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });

  // ─── API routes ────────────────────────────────────────────────────────────
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/feed', feedRouter);
  app.use('/api/v1/content', contentRouter);
  app.use('/api/v1/referrals', referralsRouter);
  app.use('/api/v1/chat', chatRouter);
  app.use('/api/v1/reputation', reputationRouter);

  // ─── Error handler (must be last) ─────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
