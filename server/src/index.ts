import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config, validateConfig } from './core/config';
import { logger } from './core/logger';
import { requestIdMiddleware, securityHeaders, rateLimiter, sanitizeInput } from './core/middleware/security';

import healthRoutes from './api/routes/health';
import authRoutes from './api/routes/auth';
import kycRoutes from './api/routes/kyc';
import documentsRoutes from './api/routes/documents';
import assetsRoutes from './api/routes/assets';
import liquidityRoutes from './api/routes/liquidity';

const app = express();

validateConfig();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use(requestIdMiddleware as express.RequestHandler);
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(rateLimiter(config.security.rateLimit.windowMs, config.security.rateLimit.max));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/liquidity', liquidityRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: (req as unknown as { requestId?: string }).requestId,
  });
});

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Vault Private API Server running on port ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT,
  });
  
  logger.info('Available endpoints:', {
    health: '/api/health',
    auth: '/api/auth',
    kyc: '/api/kyc',
    documents: '/api/documents',
    assets: '/api/assets',
    liquidity: '/api/liquidity',
  });
});

export default app;
