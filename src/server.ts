import app from './app';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info'
});

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

const server = app.listen(port, host, () => {
  logger.info({ port, host }, 'HTTP server started');
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'Received shutdown signal, closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
