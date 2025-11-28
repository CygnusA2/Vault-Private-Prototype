import { Router, Request, Response } from 'express';
import { config } from '../../core/config';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

router.get('/ready', (req: Request, res: Response) => {
  const integrationStatus = {
    docusign: !!config.integrations.docusign.apiKey,
    openai: !!config.integrations.openai.apiKey,
    canton: !!config.integrations.canton.apiKey,
    stewart: !!config.integrations.stewart.apiKey,
    woltersKluwer: !!config.integrations.woltersKluwer.apiKey,
  };

  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    integrations: integrationStatus,
  });
});

export default router;
