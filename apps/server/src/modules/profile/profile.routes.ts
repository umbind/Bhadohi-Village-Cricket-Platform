/**
 * Player Profile & Discovery REST Routes
 */

import { Router, Request, Response } from 'express';
import { profileService } from './profile.service.js';
import { authenticate } from '../../middleware/authenticate.js';

export const profileRouter = Router();

// 1. Get Logged-in User's Profile
profileRouter.get('/profiles/me', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await profileService.getMyProfile(req.user!.userId);
    res.status(200).json({
      success: true,
      data: profile,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'PROFILE_FETCH_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Create or Update Logged-in User's Profile
profileRouter.put('/profiles/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { full_name, village, block, primary_role, batting_style, bowling_style, allow_whatsapp_contact } = req.body;
    const updated = await profileService.upsertProfile(req.user!.userId, {
      fullName: full_name,
      village,
      block,
      primaryRole: primary_role,
      battingStyle: batting_style || 'दाएं हाथ',
      bowlingStyle: bowling_style || 'मध्यम गति',
      allowWhatsappContact: allow_whatsapp_contact !== false
    });

    res.status(200).json({
      success: true,
      data: updated,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'प्रोफ़ाइल सहेजने में त्रुटि।' },
      timestamp: new Date().toISOString()
    });
  }
});

// 2b. Update Profile by Specific User ID (SEC-01: Reject if not owner)
profileRouter.put('/profiles/:id', authenticate, async (req: Request, res: Response) => {
  if (req.params.id !== req.user!.userId) {
    res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'FORBIDDEN_NOT_PROFILE_OWNER',
        message: 'आप केवल अपनी प्रोफ़ाइल अद्यतन कर सकते हैं।'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const { full_name, village, block, primary_role, batting_style, bowling_style, allow_whatsapp_contact } = req.body;
    const updated = await profileService.upsertProfile(req.user!.userId, {
      fullName: full_name,
      village,
      block,
      primaryRole: primary_role,
      battingStyle: batting_style || 'दाएं हाथ',
      bowlingStyle: bowling_style || 'मध्यम गति',
      allowWhatsappContact: allow_whatsapp_contact !== false
    });

    res.status(200).json({
      success: true,
      data: updated,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'प्रोफ़ाइल सहेजने में त्रुटि।' },
      timestamp: new Date().toISOString()
    });
  }
});


// 3. Update Availability Window
profileRouter.patch('/profiles/me/availability', authenticate, async (req: Request, res: Response) => {
  try {
    const { is_available, duration_days } = req.body;
    const updated = await profileService.updateAvailability(
      req.user!.userId,
      Boolean(is_available),
      parseInt(duration_days || '15', 10)
    );

    res.status(200).json({
      success: true,
      data: {
        is_available: updated.isAvailable,
        availability_expires_at: updated.availabilityExpiresAt
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'उपलब्धता अद्यतन विफल।' },
      timestamp: new Date().toISOString()
    });
  }
});

// 4. Search Players (Available to captains, phone numbers completely omitted)
profileRouter.get('/players', authenticate, async (req: Request, res: Response) => {
  try {
    const { block, role, available_only } = req.query;
    const players = await profileService.searchPlayers({
      block: block as string | undefined,
      role: role as string | undefined,
      availableOnly: available_only !== 'false'
    });

    res.status(200).json({
      success: true,
      data: players,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SEARCH_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});
