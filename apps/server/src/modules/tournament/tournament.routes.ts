/**
 * Tournament REST Routes
 */

import { Router, Request, Response } from 'express';
import { tournamentService } from './tournament.service.js';
import { authenticate } from '../../middleware/authenticate.js';

export const tournamentRouter = Router();

// Browse Tournaments
tournamentRouter.get('/tournaments', async (req: Request, res: Response) => {
  try {
    const { block, status } = req.query;
    const tournaments = await tournamentService.listTournaments({
      block: block as string | undefined,
      status: status as string | undefined
    });

    res.status(200).json({
      success: true,
      data: tournaments,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'TOURNAMENT_FETCH_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Get Tournament Details
tournamentRouter.get('/tournaments/:id', async (req: Request, res: Response) => {
  try {
    const tour = await tournamentService.getTournamentDetails(req.params.id);
    const shareText = tournamentService.generateWhatsAppShareText(tour);

    res.status(200).json({
      success: true,
      data: {
        ...tour,
        whatsapp_share_text: shareText
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'TOURNAMENT_NOT_FOUND', message: 'प्रतियोगिता नहीं मिली।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Create Tournament (Draft or Published)
tournamentRouter.post('/tournaments', authenticate, async (req: Request, res: Response) => {
  try {
    const tour = await tournamentService.createTournament(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      data: tour,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'टूर्नामेंट निर्माण विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Publish Draft Tournament
tournamentRouter.post('/tournaments/:id/publish', authenticate, async (req: Request, res: Response) => {
  try {
    const tour = await tournamentService.publishTournament(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: tour,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'टूर्नामेंट प्रकाशन विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// Cancel Tournament
tournamentRouter.post('/tournaments/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const { cancellation_reason } = req.body;
    const tour = await tournamentService.cancelTournament(req.user!.userId, req.params.id, cancellation_reason);
    res.status(200).json({
      success: true,
      data: tour,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'प्रतियोगिता निरस्त करने में त्रुटि।' },
      timestamp: new Date().toISOString()
    });
  }
});
