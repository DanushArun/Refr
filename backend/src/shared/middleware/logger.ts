import pino from 'pino';

// Structured logger using pino.
// In production (NODE_ENV=production) logs are emitted as newline-delimited JSON
// and should be shipped to your log aggregator (e.g. Grafana Loki).
// In development, pino-pretty formats them for human readability if installed.
const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    service: 'refr-api',
    env: process.env.NODE_ENV ?? 'development',
  },
});
