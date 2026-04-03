import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './shared/middleware/logger.js';
import { prisma } from './lib/prisma.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function start() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  logger.info('Database connected');

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'REFR API server started');
  });

  // Graceful shutdown: finish in-flight requests before closing
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
