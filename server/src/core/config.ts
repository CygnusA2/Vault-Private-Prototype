import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.API_PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'vault-private-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  integrations: {
    docusign: {
      apiKey: process.env.DOCUSIGN_API_KEY,
      accountId: process.env.DOCUSIGN_ACCOUNT_ID,
      baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
    canton: {
      apiUrl: process.env.CANTON_API_URL,
      apiKey: process.env.CANTON_API_KEY,
    },
    stewart: {
      apiUrl: process.env.STEWART_API_URL,
      apiKey: process.env.STEWART_API_KEY,
    },
    woltersKluwer: {
      apiUrl: process.env.WOLTERS_KLUWER_API_URL,
      apiKey: process.env.WOLTERS_KLUWER_API_KEY,
    },
  },
  
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },
};

export function validateConfig(): void {
  const requiredInProduction = [
    'JWT_SECRET',
  ];
  
  if (config.nodeEnv === 'production') {
    const missing = requiredInProduction.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
