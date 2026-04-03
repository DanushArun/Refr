import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/middleware/logger.js';

// Singleton PrismaClient.
// In development, tsx re-evaluates modules on each file save, which would
// create a new PrismaClient (and connection pool) each time.  We store the
// instance on globalThis to survive hot reloads.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
  // Log slow queries (>200ms) in development to catch N+1 problems early
  prisma.$on('query', (e) => {
    if (e.duration > 200) {
      logger.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
    }
  });
}
