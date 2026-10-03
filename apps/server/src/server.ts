/**
 * HTTP Server Entry Point
 */

import { createApp } from './app.js';
import { config } from './config/environment.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`[BVCP Server] Server listening on http://${config.host}:${config.port}`);
  console.log(`[BVCP Server] Environment: ${config.nodeEnv} | Target: Bhadohi District, UP`);
});

process.on('SIGTERM', () => {
  console.log('[BVCP Server] SIGTERM received. Gracefully shutting down...');
  server.close(() => {
    console.log('[BVCP Server] Process terminated.');
    process.exit(0);
  });
});
