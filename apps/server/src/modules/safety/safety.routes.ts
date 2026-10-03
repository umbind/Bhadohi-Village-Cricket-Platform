/**
 * Safety & Moderation REST API Routes
 */

import { Router, Request, Response } from 'express';
import { safetyService } from './safety.service.js';
import { expiryEngine } from '../../jobs/expiry.job.js';
import { authenticate } from '../../middleware/authenticate.js';

export const safetyRouter = Router();

// 1. Submit a Report (Max 5 reports per 24 hours)
safetyRouter.post('/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { target_type, targetType, target_id, targetId, reason_category, reasonCategory, description } = req.body;

    const report = await safetyService.submitReport(userId, {
      targetType: targetType || target_type,
      targetId: targetId || target_id,
      reasonCategory: reasonCategory || reason_category,
      description
    });

    return res.status(201).json({
      success: true,
      data: report,
      message: 'आपकी रिपोर्ट दर्ज कर ली गई है और आयोजन समिति द्वारा समीक्षा की जाएगी।'
    });
  } catch (err: any) {
    const statusCode = err.message === 'REPORT_RATE_LIMIT_EXCEEDED' ? 429 : 400;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.message, message: 'रिपोर्ट दर्ज करने में विफल' }
    });
  }
});

// 2. Block a User
safetyRouter.post('/blocks', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const blockedUserId = req.body.blocked_user_id || req.body.blockedUserId;

    if (!blockedUserId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BLOCKED_USER', message: 'अवरुद्ध करने हेतु उपयोगकर्ता आईडी आवश्यक है' }
      });
    }

    const block = await safetyService.blockUser(userId, blockedUserId);

    return res.status(201).json({
      success: true,
      data: block,
      message: 'उपयोगकर्ता को सफलतापूर्वक अवरुद्ध (ब्लॉक) कर दिया गया है'
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'ब्लॉक करने में विफल' }
    });
  }
});

// 3. Unblock a User
safetyRouter.delete('/blocks/:blockedUserId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { blockedUserId } = req.params;

    const unblocked = await safetyService.unblockUser(userId, blockedUserId);

    return res.status(200).json({
      success: true,
      data: { unblocked },
      message: 'उपयोगकर्ता को अनब्लॉक कर दिया गया है'
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'अनब्लॉक करने में विफल' }
    });
  }
});

// 4. List Blocked Users
safetyRouter.get('/blocks', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const blockedUserIds = await safetyService.getBlockedUsers(userId);

    return res.status(200).json({
      success: true,
      data: blockedUserIds
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'ब्लॉक सूची प्राप्त करने में विफल' }
    });
  }
});

// 5. Admin Moderation Queue
safetyRouter.get('/admin/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_NOT_MODERATOR', message: 'केवल आयोजक या व्यवस्थापक रिपोर्ट देख सकते हैं' }
      });
    }

    const { status, targetType } = req.query;
    const reports = await safetyService.getModerationQueue({
      status: status as any,
      targetType: targetType as any
    });

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'कतार प्राप्त करने में विफल' }
    });
  }
});

// 6. Admin Review Report
safetyRouter.patch('/admin/reports/:id/review', authenticate, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    const userId = (req as any).user.userId;
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_NOT_MODERATOR', message: 'केवल आयोजक या व्यवस्थापक समीक्षा कर सकते हैं' }
      });
    }

    const { id } = req.params;
    const { action, adminNotes } = req.body;

    const updated = await safetyService.reviewReport(userId, id, action, adminNotes);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'रिपोर्ट की समीक्षा सफलतापूर्वक पूर्ण हुई'
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'समीक्षा अद्यतन विफल' }
    });
  }
});

// 7. Manual Trigger of Expiry Jobs (Admin/Organizer only)
safetyRouter.post('/admin/jobs/run-expiry', authenticate, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_NOT_ADMIN', message: 'कार्य निष्पादन की अनुमति नहीं है' }
      });
    }

    const results = await expiryEngine.runAllNightlyJobs();

    return res.status(200).json({
      success: true,
      data: results,
      message: 'सभी रखरखाव एवं अवसान कार्य सफलतापूर्वक संपन्न हुए'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: err.message, message: 'कार्य निष्पादन विफल' }
    });
  }
});
