/**
 * Player Invitation & Scouting REST Routes
 */

import { Router, Request, Response } from 'express';
import { invitationService } from './invitation.service.js';
import { authenticate } from '../../middleware/authenticate.js';

export const invitationRouter = Router();

// 1. Scouting available players (Authenticated)
invitationRouter.get('/players/scout', authenticate, async (req: Request, res: Response) => {
  try {
    const { block, role, battingStyle, bowlingStyle, availableOnly } = req.query;
    const players = await invitationService.scoutPlayers({
      block: block as string | undefined,
      role: role as string | undefined,
      battingStyle: battingStyle as string | undefined,
      bowlingStyle: bowlingStyle as string | undefined,
      availableOnly: availableOnly !== 'false'
    });

    return res.status(200).json({
      success: true,
      data: players
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'खिलाड़ी खोज विफल रही' }
    });
  }
});

// 2. Send Invitation to Player (Captain Only)
invitationRouter.post('/teams/:teamId/invitations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { teamId } = req.params;
    const inviteeIdentifier = req.body.invitee_user_id || req.body.inviteeUserId || req.body.inviteeIdentifier || req.body.playerId;

    if (!inviteeIdentifier) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INVITEE', message: 'खिलाड़ी आईडी अनिवार्य है' }
      });
    }

    const invitation = await invitationService.sendInvitation(userId, teamId, inviteeIdentifier);

    return res.status(201).json({
      success: true,
      data: invitation,
      message: 'खिलाड़ी को निमंत्रण भेज दिया गया है'
    });
  } catch (err: any) {
    const statusCode = err.message.startsWith('FORBIDDEN') ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.message, message: 'निमंत्रण भेजने में विफल' }
    });
  }
});

// 3. List Invitations Sent by Team (Captain Only)
invitationRouter.get('/teams/:teamId/invitations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { teamId } = req.params;
    const invitations = await invitationService.getSentInvitations(userId, teamId);

    return res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (err: any) {
    const statusCode = err.message.startsWith('FORBIDDEN') ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.message, message: 'निमंत्रण सूची प्राप्त नहीं हो सकी' }
    });
  }
});

// 4. List Invitations Received by Current Player
invitationRouter.get('/invitations/received', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const status = req.query.status as any;
    const invitations = await invitationService.getReceivedInvitations(userId, status);

    return res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: err.message, message: 'निमंत्रण प्राप्त करने में विफल' }
    });
  }
});

// 5. Respond to Invitation (Invited Player Only)
invitationRouter.patch('/invitations/:id/respond', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const action = req.body.action?.toUpperCase();

    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'कार्रवाई केवल ACCEPT या DECLINE होनी चाहिए' }
      });
    }

    const result = await invitationService.respondToInvitation(userId, id, action);

    return res.status(200).json({
      success: true,
      data: result,
      message: action === 'ACCEPT' ? 'निमंत्रण स्वीकार कर लिया गया है' : 'निमंत्रण अस्वीकार कर दिया गया है'
    });
  } catch (err: any) {
    const statusCode = err.message.startsWith('FORBIDDEN') ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.message, message: 'प्रतिक्रिया दर्ज करने में विफल' }
    });
  }
});

// 6. Cancel Invitation (Captain Only)
invitationRouter.delete('/invitations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const cancelled = await invitationService.cancelInvitation(userId, id);

    return res.status(200).json({
      success: true,
      data: cancelled,
      message: 'निमंत्रण रद्द कर दिया गया है'
    });
  } catch (err: any) {
    const statusCode = err.message.startsWith('FORBIDDEN') ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.message, message: 'निमंत्रण रद्द करने में विफल' }
    });
  }
});
