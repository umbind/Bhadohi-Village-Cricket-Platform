/**
 * JWT Authentication Middleware
 * Enforces session security and attaches decoded user claims to Express Request.
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';

export interface AuthenticatedUser {
  userId: string;
  role: string;
  mobileMasked: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'प्रमाणीकरण आवश्यक है। कृपया लॉग इन करें।'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const claims = authService.verifyJwt(token);
    req.user = {
      userId: claims.sub,
      role: claims.role,
      mobileMasked: claims.mobileMasked
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      data: null,
      error: {
        code: 'INVALID_TOKEN',
        message: 'सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।'
      },
      timestamp: new Date().toISOString()
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: 'इस कार्रवाई के लिए पर्याप्त अधिकार नहीं हैं।'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    next();
  };
}

