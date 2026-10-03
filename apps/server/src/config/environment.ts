/**
 * Typed Environment Configuration Module
 */

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  authMaxFailedAttempts: number;
  corsAllowedOrigins: string[];
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bvcp_dev',
    jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-key-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    authMaxFailedAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || '5', 10),
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  };
}

export const config = loadConfig();
