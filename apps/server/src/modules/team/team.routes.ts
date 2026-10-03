/**
 * Team & Application REST Routes
 */

import { Router, Request, Response } from 'express';
import { teamService } from './team.service.js';
import { authenticate } from '../../middleware/authenticate.js';

export const teamRouter = Router();

// Create Temporary Team for Tournament
teamRouter.post('/tournaments/:tournamentId/teams', authenticate, async (req: Request, res: Response) => {
  try {
    const { team_name, village } = req.body;
    const team = await teamService.createTeam(req.user!.userId, req.params.tournamentId, {
      teamName: team_name,
      village
    });

    res.status(201).json({
      success: true,
      data: team,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'टीम निर्माण विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Get My Teams
teamRouter.get('/teams/my', authenticate, async (req: Request, res: Response) => {
  try {
    const teams = await teamService.getMyTeams(req.user!.userId);
    res.status(200).json({
      success: true,
      data: teams,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'TEAMS_FETCH_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Get Team Details & Roster
teamRouter.get('/teams/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const details = await teamService.getTeamDetails(req.params.id);
    res.status(200).json({
      success: true,
      data: details,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'TEAM_NOT_FOUND', message: 'टीम नहीं मिली।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Submit Team Application to Tournament
teamRouter.post('/tournaments/:tournamentId/applications', authenticate, async (req: Request, res: Response) => {
  try {
    const { team_id } = req.body;
    const app = await teamService.submitApplication(req.user!.userId, req.params.tournamentId, team_id);
    res.status(201).json({
      success: true,
      data: app,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const status = err.message === 'DUPLICATE_APPLICATION' ? 409 : 400;
    res.status(status).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'आवेदन जमा करने में त्रुटि।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Withdraw Application
teamRouter.post('/applications/:id/withdraw', authenticate, async (req: Request, res: Response) => {
  try {
    const app = await teamService.withdrawApplication(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: app,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'आवेदन वापस लेना विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Organizer Review Application
teamRouter.patch('/applications/:id/review', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, reason } = req.body;
    const app = await teamService.reviewApplication(req.user!.userId, req.params.id, status, reason);
    res.status(200).json({
      success: true,
      data: app,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const status = err.message === 'FORBIDDEN_NOT_ORGANIZER' ? 403 : 400;
    res.status(status).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'समीक्षा कार्रवाई विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Remove Player from Team Roster (Captain Only - SEC-02)
teamRouter.delete('/teams/:teamId/members/:playerUserId', authenticate, async (req: Request, res: Response) => {
  try {
    await teamService.removePlayerFromTeam(req.user!.userId, req.params.teamId, req.params.playerUserId);
    res.status(200).json({
      success: true,
      data: { message: 'खिलाड़ी को टीम से हटा दिया गया है।' },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const status = err.message === 'FORBIDDEN_NOT_CAPTAIN' ? 403 : 400;
    res.status(status).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'खिलाड़ी हटाने में त्रुटि।' },
      timestamp: new Date().toISOString()
    });
  }
});

