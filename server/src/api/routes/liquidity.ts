import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';

const router = Router();

router.use(authMiddleware);

const liquidityRequestSchema = z.object({
  tokenAmount: z.number().positive(),
  tokenSymbol: z.string().default('CST'),
  targetCurrency: z.string().default('GBP'),
  urgency: z.enum(['standard', 'express', 'immediate']).default('standard'),
});

const drawdownSchema = z.object({
  offerId: z.string(),
  amount: z.number().positive(),
  destinationAccount: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    sortCode: z.string().optional(),
    iban: z.string().optional(),
  }),
});

router.get('/offers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Liquidity offers requested', { userId: req.user!.id });

    // In production, aggregate from lender syndicate APIs
    const offers = [
      {
        id: 'offer_1',
        lender: 'Private Credit Fund I',
        maxAmount: 5000000,
        currency: 'GBP',
        interestRate: 4.5,
        term: '12 months',
        collateralRequirement: 'tokens',
        status: 'available',
      },
      {
        id: 'offer_2',
        lender: 'Institutional Syndicate',
        maxAmount: 10000000,
        currency: 'GBP',
        interestRate: 5.2,
        term: '24 months',
        collateralRequirement: 'tokens',
        status: 'available',
      },
      {
        id: 'offer_3',
        lender: 'Bridge Capital Partners',
        maxAmount: 2000000,
        currency: 'GBP',
        interestRate: 6.0,
        term: '6 months',
        collateralRequirement: 'tokens',
        status: 'available',
      },
    ];

    res.json({
      success: true,
      offers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Liquidity offers fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch liquidity offers' });
  }
});

router.post('/request', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tokenAmount, tokenSymbol, targetCurrency, urgency } = liquidityRequestSchema.parse(req.body);

    logger.audit('liquidity_request_created', req.user!.id, { tokenAmount, urgency });

    // In production, submit to lender APIs
    const request = {
      id: `req_${Date.now()}`,
      userId: req.user!.id,
      tokenAmount,
      tokenSymbol,
      targetCurrency,
      urgency,
      status: 'pending',
      estimatedValue: tokenAmount * 1000, // 1 token = £1000
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Liquidity request failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to create liquidity request' });
  }
});

router.post('/drawdown', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { offerId, amount, destinationAccount } = drawdownSchema.parse(req.body);

    logger.audit('drawdown_initiated', req.user!.id, { offerId, amount });

    // In production, initiate actual fund transfer
    const drawdown = {
      id: `draw_${Date.now()}`,
      offerId,
      amount,
      currency: 'GBP',
      status: 'processing',
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      destinationAccount: {
        bankName: destinationAccount.bankName,
        lastFourDigits: destinationAccount.accountNumber.slice(-4),
      },
    };

    res.json({
      success: true,
      drawdown,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Drawdown failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Drawdown initiation failed' });
  }
});

router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In production, fetch from database
    const history = {
      transactions: [],
      totalBorrowed: 0,
      totalRepaid: 0,
      activeLoans: 0,
    };

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    logger.error('History fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

export default router;
