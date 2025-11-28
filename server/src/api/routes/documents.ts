import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthenticatedRequest } from '../../core/middleware/auth';
import { logger } from '../../core/logger';
import { docusignService } from '../../modules/docusign/index';

const router = Router();

router.use(authMiddleware);

const createEnvelopeSchema = z.object({
  documentType: z.enum(['kyc', 'loan_agreement', 'asset_transfer', 'tokenization_consent']),
  signerEmail: z.string().email(),
  signerName: z.string().min(1),
  documentData: z.record(z.string(), z.unknown()).optional(),
});

const webhookSchema = z.object({
  envelopeId: z.string(),
  event: z.string(),
  status: z.string(),
});

router.post('/sign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentType, signerEmail, signerName, documentData } = createEnvelopeSchema.parse(req.body);

    logger.audit('document_sign_initiated', req.user!.id, { documentType, signerEmail });

    const envelope = await docusignService.createEnvelope({
      documentType,
      signerEmail,
      signerName,
      documentData,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      envelope,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    logger.error('Document signing failed', { error: (error as Error).message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to initiate document signing' });
  }
});

router.get('/status/:envelopeId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { envelopeId } = req.params;

    const status = await docusignService.getEnvelopeStatus(envelopeId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error('Document status check failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to retrieve document status' });
  }
});

router.post('/webhook', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { envelopeId, event, status } = webhookSchema.parse(req.body);

    logger.info('DocuSign webhook received', { envelopeId, event, status });

    await docusignService.handleWebhook({ envelopeId, event, status });

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
