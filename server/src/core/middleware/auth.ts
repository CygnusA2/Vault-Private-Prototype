import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token', { error: (error as Error).message });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
      req.user = decoded;
    } catch {
      // Token invalid, continue without user
    }
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', { 
        userId: req.user.id, 
        role: req.user.role, 
        requiredRoles: roles 
      });
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function generateToken(userId: string, role: string = 'client'): string {
  return jwt.sign({ id: userId, role }, config.jwt.secret, { 
    expiresIn: config.jwt.expiresIn 
  });
}
