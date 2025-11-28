import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';

const router = Router();

const sessionSchema = z.object({
  phoneNumber: z.string().min(8),
  verificationCode: z.string().length(6),
});

const deviceAttestationSchema = z.object({
  deviceId: z.string().uuid(),
  platform: z.enum(['ios', 'android', 'web']),
  attestationToken: z.string().optional(),
});

router.post('/session', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, verificationCode } = sessionSchema.parse(req.body);
    
    // In production, verify with actual SMS gateway
    // For demo, accept code 123456
    if (verificationCode !== '123456') {
      logger.warn('Invalid verification code attempt', { phoneNumber });
      res.status(401).json({ error: 'Invalid verification code' });
      return;
    }

    const userId = `user_${Date.now()}`;
    const token = generateToken(userId, 'client');

    logger.audit('user_authenticated', userId, { phoneNumber });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        phoneNumber,
        role: 'client',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Session creation failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/device-attestation', async (req: Request, res: Response) => {
  try {
    const { deviceId, platform } = deviceAttestationSchema.parse(req.body);

    // In production, verify device attestation with Apple/Google
    // For demo, accept any valid format
    logger.info('Device attestation received', { deviceId, platform });

    res.json({
      success: true,
      deviceVerified: true,
      trustLevel: 'standard',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Device attestation failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

router.post('/refresh', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const newToken = generateToken(req.user.id, req.user.role);
  
  logger.audit('token_refreshed', req.user.id);

  res.json({
    success: true,
    token: newToken,
  });
});

export default router;
