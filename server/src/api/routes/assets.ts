import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';
import { cantonService } from '../../modules/canton/index';
import { openaiService } from '../../modules/openai/index';
import { stewartService } from '../../modules/stewart/index';
import { woltersService } from '../../modules/wolters/index';

const router = Router();

router.use(authMiddleware);

const assetSchema = z.object({
  type: z.enum(['real_estate', 'art', 'private_equity', 'wine', 'yacht', 'aircraft', 'other']),
  description: z.string().min(10),
  estimatedValue: z.number().positive(),
  currency: z.string().default('USD'),
  location: z.string().optional(),
  documentation: z.array(z.string()).optional(),
});

const tokenizeSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['real_estate', 'art', 'private_equity', 'wine', 'yacht', 'aircraft', 'other']),
  assetValue: z.number().positive(),
  tokenAmount: z.number().positive(),
  tokenSymbol: z.string().min(2).max(10),
  assetDescription: z.string().optional(),
  assetLocation: z.string().optional(),
});

const titleSearchSchema = z.object({
  propertyAddress: z.string().min(10),
  propertyType: z.enum(['residential', 'commercial', 'land', 'mixed-use']),
  state: z.string().length(2),
  county: z.string().optional(),
  parcelNumber: z.string().optional(),
});

const lienSearchSchema = z.object({
  debtorName: z.string().min(2),
  debtorType: z.enum(['individual', 'organization']),
  state: z.string().length(2),
  county: z.string().optional(),
  searchType: z.enum(['ucc', 'judgment', 'tax', 'federal', 'all']).default('all'),
  includeHistory: z.boolean().default(false),
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
    const data = tokenizeSchema.parse(req.body);

    logger.audit('asset_tokenization_started', req.user!.id, { 
      assetId: data.assetId, 
      tokenAmount: data.tokenAmount,
      assetValue: data.assetValue,
    });

    const tokenization = await cantonService.tokenizeAsset({
      assetId: data.assetId,
      assetType: data.assetType,
      assetValue: data.assetValue,
      tokenAmount: data.tokenAmount,
      tokenSymbol: data.tokenSymbol,
      userId: req.user!.id,
      assetDetails: {
        description: data.assetDescription,
        location: data.assetLocation,
      },
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

router.get('/tokenization/:transactionId/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const status = await cantonService.getTokenizationStatus(transactionId);
    
    if (!status) {
      res.status(404).json({ error: 'Tokenization session not found' });
      return;
    }

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error('Tokenization status fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch tokenization status' });
  }
});

router.post('/title-search', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = titleSearchSchema.parse(req.body);

    logger.audit('title_search_started', req.user!.id, { 
      propertyAddress: data.propertyAddress,
      state: data.state,
    });

    const result = await stewartService.searchTitle({
      ...data,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      titleSearch: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Title search failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Title search failed' });
  }
});

router.post('/lien-search', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = lienSearchSchema.parse(req.body);

    logger.audit('lien_search_started', req.user!.id, { 
      debtorName: data.debtorName,
      searchType: data.searchType,
    });

    const result = await woltersService.searchLiens({
      ...data,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      lienSearch: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Lien search failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Lien search failed' });
  }
});

router.get('/portfolio', async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Portfolio requested', { userId: req.user!.id });

    const portfolio = {
      userId: req.user!.id,
      assets: [
        { 
          id: 'asset_re_beverly', 
          type: 'real_estate', 
          description: 'Beverly Hills Estate - 12,000 sq ft',
          value: 45000000, 
          currency: 'USD', 
          tokenized: true,
          tokenSymbol: 'RE-BH-001',
          location: 'Beverly Hills, CA',
        },
        { 
          id: 'asset_art_picasso', 
          type: 'art', 
          description: 'Picasso - Les Femmes d\'Alger Series',
          value: 12000000, 
          currency: 'USD', 
          tokenized: true,
          tokenSymbol: 'ART-PC-042',
          location: 'Secured vault, Geneva',
        },
        { 
          id: 'asset_pe_tech', 
          type: 'private_equity', 
          description: 'Series B Tech Portfolio',
          value: 8500000, 
          currency: 'USD', 
          tokenized: false,
          location: 'Delaware LLC',
        },
        { 
          id: 'asset_yacht_med', 
          type: 'yacht', 
          description: '85ft Sunseeker Manhattan',
          value: 4200000, 
          currency: 'USD', 
          tokenized: false,
          location: 'Monaco Harbor',
        },
      ],
      totalValue: 69700000,
      tokenizedValue: 57000000,
      availableForTokenization: 12700000,
      lastUpdated: new Date().toISOString(),
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

router.get('/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await cantonService.getTransactionHistory(req.user!.id);

    res.json({
      success: true,
      transactions: history,
    });
  } catch (error) {
    logger.error('Transaction history fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

router.post('/verify-proof/:transactionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const verification = await cantonService.verifyProof(transactionId);

    logger.audit('proof_verified', req.user!.id, { transactionId });

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    logger.error('Proof verification failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to verify proof' });
  }
});

export default router;
