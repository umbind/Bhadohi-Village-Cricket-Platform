/**
 * Master Express Application Factory
 * Configures middleware, security headers, routing, and error handling.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { tournamentRouter } from './modules/tournament/tournament.routes.js';
import { teamRouter } from './modules/team/team.routes.js';
import { notificationRouter } from './modules/notification/notification.routes.js';
import { invitationRouter } from './modules/invitation/invitation.routes.js';
import { safetyRouter } from './modules/safety/safety.routes.js';

export function createApp(): express.Application {
  const app = express();

  // 1. Security & Core Middleware
  app.use(helmet());
  app.use(cors({
    origin: config.corsAllowedOrigins,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 2. Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'bvcp-api-server',
      district: 'Bhadohi, Uttar Pradesh',
      timestamp: new Date().toISOString()
    });
  });

  // 3. API v1 Base Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1', profileRouter);
  app.use('/api/v1', tournamentRouter);
  app.use('/api/v1', teamRouter);
  app.use('/api/v1', notificationRouter);
  app.use('/api/v1', invitationRouter);
  app.use('/api/v1', safetyRouter);

  app.get('/api/v1', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म REST API v1',
        endpoints: {
          auth: '/api/v1/auth',
          profiles: '/api/v1/profiles',
          players: '/api/v1/players',
          scouting: '/api/v1/players/scout',
          tournaments: '/api/v1/tournaments',
          teams: '/api/v1/teams',
          invitations: '/api/v1/invitations',
          notifications: '/api/v1/notifications',
          reports: '/api/v1/reports',
          blocks: '/api/v1/blocks',
          moderation: '/api/v1/admin/reports'
        }
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  });

  // 4. Centralized 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'अनुरोधित पृष्ठ या एंडपॉइंट उपलब्ध नहीं है।'
      },
      timestamp: new Date().toISOString()
    });
  });

  // 5. Centralized Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'सर्वर पर अप्रत्याशित समस्या उत्पन्न हुई। कृपया पुनः प्रयास करें।'
      },
      timestamp: new Date().toISOString()
    });
  });

  return app;
}
