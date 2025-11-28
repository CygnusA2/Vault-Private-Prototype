import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

export interface RequestWithId extends Request {
  requestId: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (clientData.count >= maxRequests) {
      logger.warn('Rate limit exceeded', { clientId, count: clientData.count });
      res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000) 
      });
      return;
    }
    
    clientData.count++;
    next();
  };
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = value.replace(/[<>]/g, '');
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitize(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  next();
}
