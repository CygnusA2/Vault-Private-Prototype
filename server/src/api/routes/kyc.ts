import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';

const router = Router();

router.use(authMiddleware);

const kycDataSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  documents: z.array(z.object({
    type: z.enum(['passport', 'drivers_license', 'national_id', 'proof_of_address', 'bank_statement']),
    documentId: z.string(),
    verified: z.boolean().default(false),
  })).optional(),
});

router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In production, fetch from database
    const kycStatus = {
      userId: req.user!.id,
      status: 'pending', // pending, in_progress, verified, rejected
      completedSteps: ['personal_details', 'documents'],
      remainingSteps: ['biometric', 'address', 'compliance_check'],
      complianceChecks: {
        dowJones: 'pending',
        lsegWorldCheck: 'pending',
        pep: 'pending',
        sanctions: 'pending',
      },
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      kyc: kycStatus,
    });
  } catch (error) {
    logger.error('KYC status fetch failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

router.post('/submit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kycData = kycDataSchema.parse(req.body);

    logger.audit('kyc_data_submitted', req.user!.id, { 
      hasAddress: !!kycData.address,
      documentCount: kycData.documents?.length || 0,
    });

    // In production, store in database and trigger verification workflows
    const submission = {
      id: `kyc_${Date.now()}`,
      userId: req.user!.id,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '24-48 hours',
    };

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('KYC submission failed', { error: (error as Error).message });
    res.status(500).json({ error: 'KYC submission failed' });
  }
});

router.post('/compliance-check', async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.audit('compliance_check_initiated', req.user!.id);

    // In production, call Dow Jones, LSEG World-Check APIs
    const complianceResult = {
      userId: req.user!.id,
      checks: {
        dowJones: {
          status: 'clear',
          checkedAt: new Date().toISOString(),
          riskLevel: 'low',
        },
        lsegWorldCheck: {
          status: 'clear',
          checkedAt: new Date().toISOString(),
          riskLevel: 'low',
        },
        pep: {
          status: 'clear',
          isPEP: false,
        },
        sanctions: {
          status: 'clear',
          onSanctionsList: false,
        },
      },
      overallStatus: 'approved',
      reviewedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      compliance: complianceResult,
    });
  } catch (error) {
    logger.error('Compliance check failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Compliance check failed' });
  }
});

export default router;
