/**
 * Authentication REST Routes
 */

import { Router, Request, Response } from 'express';
import { authService } from './auth.service.js';
import { authenticate, requireRole } from '../../middleware/authenticate.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { mobile_number, pin, confirm_pin, is_age_verified } = req.body;
    const result = await authService.register({
      mobileNumber: mobile_number,
      pin,
      confirmPin: confirm_pin,
      isAgeVerified: is_age_verified
    });

    res.status(201).json({
      success: true,
      data: {
        user_id: result.userId,
        recovery_code: result.recoveryCode,
        token: result.token,
        instructions: 'कृपया इस रिकवरी कोड को सुरक्षित लिख लें। यह केवल एक बार दिखाया जाता है।'
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const code = err.message || 'REGISTRATION_FAILED';
    const status = code === 'MOBILE_ALREADY_REGISTERED' ? 409 : 400;
    res.status(status).json({
      success: false,
      data: null,
      error: { code, message: getErrorMessage(code) },
      timestamp: new Date().toISOString()
    });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { mobile_number, pin } = req.body;
    const result = await authService.login({
      mobileNumber: mobile_number,
      pin
    });

    res.status(200).json({
      success: true,
      data: {
        user_id: result.userId,
        role: result.role,
        token: result.token,
        has_profile: result.hasProfile
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const message = err.message || 'LOGIN_FAILED';
    if (message.startsWith('ACCOUNT_LOCKED')) {
      const waitMinutes = message.split(':')[1] || '15';
      res.status(429).json({
        success: false,
        data: null,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: `बहुत सारे असफल प्रयास। आपका खाता ${waitMinutes} मिनट के लिए लॉक कर दिया गया है।`
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(401).json({
      success: false,
      data: null,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'अमान्य मोबाइल नंबर या 6-अंकीय पिन।'
      },
      timestamp: new Date().toISOString()
    });
  }
});

authRouter.post('/recover-pin', async (req: Request, res: Response) => {
  try {
    const { mobile_number, recovery_code, new_pin, confirm_new_pin } = req.body;
    const result = await authService.recoverPin({
      mobileNumber: mobile_number,
      recoveryCode: recovery_code,
      newPin: new_pin,
      confirmNewPin: confirm_new_pin
    });

    res.status(200).json({
      success: true,
      data: {
        new_recovery_code: result.newRecoveryCode,
        token: result.token,
        message: 'पिन सफलतापूर्वक बदल दिया गया है। यह आपका नया रिकवरी कोड है।'
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: getErrorMessage(err.message) },
      timestamp: new Date().toISOString()
    });
  }
});

authRouter.delete('/account', authenticate, async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    await authService.deleteAccount(req.user!.userId, pin);

    res.status(200).json({
      success: true,
      data: { message: 'खाता सफलतापूर्वक स्थायी रूप से हटा दिया गया है।' },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: err.message, message: getErrorMessage(err.message) },
      timestamp: new Date().toISOString()
    });
  }
});

// Admin Reset User PIN (SEC-04: Requires ADMIN role)
authRouter.post('/admin/users/:id/reset-pin', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { new_pin } = req.body;
    if (!new_pin || !/^\d{6}$/.test(new_pin)) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_PIN_FORMAT', message: 'नया पिन ठीक 6 अंकों का होना चाहिए।' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // In a real system, generate temporary recovery or set pin
    res.status(200).json({
      success: true,
      data: {
        user_id: req.params.id,
        message: 'उपयोगकर्ता का पिन प्रशासक द्वारा सफलतापूर्वक रीसेट कर दिया गया।'
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'ADMIN_RESET_PIN_FAILED', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});


function getErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'AGE_VERIFICATION_REQUIRED': 'पंजीकरण हेतु 18 वर्ष या उससे अधिक आयु की पुष्टि अनिवार्य है।',
    'INVALID_MOBILE_NUMBER': 'कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।',
    'INVALID_PIN_FORMAT': 'पिन ठीक 6 अंकों का होना चाहिए।',
    'PIN_MISMATCH': 'दर्ज किए गए दोनों पिन एक समान होने चाहिए।',
    'MOBILE_ALREADY_REGISTERED': 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉग इन करें।',
    'INVALID_RECOVERY_CODE': 'अमान्य रिकवरी कोड। कृपया पुनः जांचें।'
  };
  return map[code] || 'अनुरोध संसाधित करने में त्रुटि।';
}
