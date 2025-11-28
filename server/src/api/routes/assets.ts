import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';
import { cantonService } from '../../modules/canton/index';
import { openaiService } from '../../modules/openai/index';

const router = Router();

router.use(authMiddleware);

const assetSchema = z.object({
  type: z.enum(['real_estate', 'art', 'private_equity', 'wine', 'other']),
  description: z.string().min(10),
  estimatedValue: z.number().positive(),
  currency: z.string().default('GBP'),
  documentation: z.array(z.string()).optional(),
});

const tokenizeSchema = z.object({
  assetId: z.string(),
  tokenAmount: z.number().positive(),
  tokenSymbol: z.string().default('CST'),
});

router.post('/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const asset = assetSchema.parse(req.body);

    logger.audit('asset_verification_started', req.user!.id, { assetType: asset.type });

    const verification = await openaiService.verifyAsset({
      ...asset,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Asset verification failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Asset verification failed' });
  }
});

router.post('/tokenize', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assetId, tokenAmount, tokenSymbol } = tokenizeSchema.parse(req.body);

    logger.audit('asset_tokenization_started', req.user!.id, { assetId, tokenAmount });

    const tokenization = await cantonService.tokenizeAsset({
      assetId,
      tokenAmount,
      tokenSymbol,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      tokenization,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Asset tokenization failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Asset tokenization failed' });
  }
});

router.get('/portfolio', async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Portfolio requested', { userId: req.user!.id });

    // In production, fetch from database
    const portfolio = {
      userId: req.user!.id,
      assets: [
        { id: 'asset_1', type: 'real_estate', value: 5000000, currency: 'GBP', tokenized: false },
        { id: 'asset_2', type: 'real_estate', value: 2000000, currency: 'GBP', tokenized: false },
        { id: 'asset_3', type: 'art', value: 1850000, currency: 'GBP', tokenized: false },
        { id: 'asset_4', type: 'private_equity', value: 2500000, currency: 'GBP', tokenized: false },
      ],
      totalValue: 11350000,
      tokenizedValue: 0,
    };

    res.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    logger.error('Portfolio fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

router.get('/tokens', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tokens = await cantonService.getTokenBalance(req.user!.id);

    res.json({
      success: true,
      tokens,
    });
  } catch (error) {
    logger.error('Token balance fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch token balance' });
  }
});

export default router;
