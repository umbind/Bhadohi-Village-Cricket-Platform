/**
 * Notification REST Routes
 */

import { Router, Request, Response } from 'express';
import { notificationRepository } from '../../repositories/notification.repository.js';
import { authenticate } from '../../middleware/authenticate.js';

export const notificationRouter = Router();

notificationRouter.get('/notifications', authenticate, async (req: Request, res: Response) => {
  try {
    const list = await notificationRepository.findByUserId(req.user!.userId);
    res.status(200).json({
      success: true,
      data: list,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'NOTIFICATIONS_FETCH_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});

notificationRouter.patch('/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await notificationRepository.markAsRead(req.params.id);
    res.status(200).json({
      success: true,
      data: { message: 'अधिसूचना पढ़ी गई।' },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'UPDATE_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});
