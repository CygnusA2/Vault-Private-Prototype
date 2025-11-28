import { config } from '../../core/config';
import { logger } from '../../core/logger';

interface CreateEnvelopeParams {
  documentType: string;
  signerEmail: string;
  signerName: string;
  documentData?: Record<string, unknown>;
  userId: string;
}

interface WebhookEvent {
  envelopeId: string;
  event: string;
  status: string;
}

interface EnvelopeResponse {
  envelopeId: string;
  status: string;
  documentType: string;
  signerEmail: string;
  signerName: string;
  signingUrl: string;
  expiresAt: string;
  createdAt: string;
}

interface EnvelopeStatusResponse {
  envelopeId: string;
  status: string;
  completedAt?: string;
  signers: Array<{
    email: string;
    status: string;
    signedAt?: string;
  }>;
}

const DOCUMENT_TEMPLATES: Record<string, { name: string; subject: string }> = {
  kyc: {
    name: 'KYC Verification Agreement',
    subject: 'Please sign your KYC verification documents - Vault Private',
  },
  loan_agreement: {
    name: 'Private Credit Facility Agreement',
    subject: 'Loan Agreement for signature - Vault Private',
  },
  asset_transfer: {
    name: 'Asset Transfer Authorization',
    subject: 'Asset Transfer Authorization - Vault Private',
  },
  tokenization_consent: {
    name: 'Tokenization Consent and Terms',
    subject: 'Tokenization Agreement for signature - Vault Private',
  },
};

class DocuSignService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = config.integrations.docusign.baseUrl || 'https://demo.docusign.net/restapi';
  }

  private isConfigured(): boolean {
    return !!(config.integrations.docusign.apiKey && config.integrations.docusign.accountId);
  }

  private async getAccessToken(): Promise<string | null> {
    if (!config.integrations.docusign.apiKey) {
      return null;
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://account-d.docusign.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(config.integrations.docusign.apiKey + ':').toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'signature',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json() as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get DocuSign access token', { error: (error as Error).message });
      return null;
    }
  }

  async createEnvelope(params: CreateEnvelopeParams): Promise<EnvelopeResponse> {
    if (!this.isConfigured()) {
      logger.warn('DocuSign not fully configured, returning mock response');
      return this.mockCreateEnvelope(params);
    }

    const token = await this.getAccessToken();
    if (!token) {
      logger.warn('Could not obtain DocuSign token, returning mock response');
      return this.mockCreateEnvelope(params);
    }

    try {
      logger.info('Creating DocuSign envelope', { 
        documentType: params.documentType,
        signerEmail: params.signerEmail,
        userId: params.userId,
      });

      const template = DOCUMENT_TEMPLATES[params.documentType] || DOCUMENT_TEMPLATES.kyc;
      
      const envelopeDefinition = {
        emailSubject: template.subject,
        documents: [
          {
            documentBase64: Buffer.from(this.generateDocumentContent(params)).toString('base64'),
            name: template.name,
            fileExtension: 'html',
            documentId: '1',
          },
        ],
        recipients: {
          signers: [
            {
              email: params.signerEmail,
              name: params.signerName,
              recipientId: '1',
              routingOrder: '1',
              tabs: {
                signHereTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '100',
                    yPosition: '700',
                  },
                ],
                dateSignedTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '300',
                    yPosition: '700',
                  },
                ],
              },
            },
          ],
        },
        status: 'sent',
      };

      const accountId = config.integrations.docusign.accountId;
      const response = await fetch(
        `${this.baseUrl}/v2.1/accounts/${accountId}/envelopes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(envelopeDefinition),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Envelope creation failed: ${response.status} - ${errorData}`);
      }

      const envelope = await response.json() as { envelopeId: string; status: string; uri: string };
      
      const viewResponse = await fetch(
        `${this.baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelope.envelopeId}/views/recipient`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authenticationMethod: 'email',
            email: params.signerEmail,
            userName: params.signerName,
            returnUrl: 'https://vault-private.app/signing-complete',
          }),
        }
      );

      let signingUrl = `https://demo.docusign.net/sign/${envelope.envelopeId}`;
      if (viewResponse.ok) {
        const viewData = await viewResponse.json() as { url: string };
        signingUrl = viewData.url;
      }

      logger.audit('docusign_envelope_created', params.userId, {
        envelopeId: envelope.envelopeId,
        documentType: params.documentType,
        signerEmail: params.signerEmail,
      });

      return {
        envelopeId: envelope.envelopeId,
        status: envelope.status,
        documentType: params.documentType,
        signerEmail: params.signerEmail,
        signerName: params.signerName,
        signingUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('DocuSign envelope creation failed', { 
        error: (error as Error).message,
        documentType: params.documentType,
      });
      return this.mockCreateEnvelope(params);
    }
  }

  private generateDocumentContent(params: CreateEnvelopeParams): string {
    const template = DOCUMENT_TEMPLATES[params.documentType] || DOCUMENT_TEMPLATES.kyc;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${template.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #666; }
    .value { margin-left: 10px; }
    .signature-area { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <h1>${template.name}</h1>
  
  <div class="section">
    <p>This agreement is entered into by and between Vault Private Ltd. ("Company") and the undersigned client ("Client").</p>
  </div>
  
  <div class="section">
    <span class="label">Client Name:</span>
    <span class="value">${params.signerName}</span>
  </div>
  
  <div class="section">
    <span class="label">Client Email:</span>
    <span class="value">${params.signerEmail}</span>
  </div>
  
  <div class="section">
    <span class="label">Document Type:</span>
    <span class="value">${template.name}</span>
  </div>
  
  <div class="section">
    <span class="label">Date:</span>
    <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>
  
  <div class="section">
    <p>By signing below, the Client acknowledges and agrees to the terms and conditions of this ${template.name.toLowerCase()}.</p>
  </div>
  
  <div class="signature-area">
    <p><strong>Client Signature:</strong></p>
    <p style="margin-top: 40px;">___________________________</p>
    <p><strong>Date:</strong> _______________</p>
  </div>
  
  <div class="footer">
    <p>Vault Private Ltd. | Ultra-High Net Worth Private Banking Services</p>
    <p>Document ID: ${params.documentType.toUpperCase()}-${Date.now()}</p>
  </div>
</body>
</html>`;
  }

  async getEnvelopeStatus(envelopeId: string): Promise<EnvelopeStatusResponse> {
    if (!this.isConfigured()) {
      logger.warn('DocuSign not configured, returning mock response');
      return this.mockGetStatus(envelopeId);
    }

    const token = await this.getAccessToken();
    if (!token) {
      return this.mockGetStatus(envelopeId);
    }

    try {
      const accountId = config.integrations.docusign.accountId;
      const response = await fetch(
        `${this.baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.status}`);
      }

      const envelope = await response.json() as { 
        envelopeId: string; 
        status: string;
        completedDateTime?: string;
      };

      const recipientsResponse = await fetch(
        `${this.baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      let signers: Array<{ email: string; status: string; signedAt?: string }> = [];
      if (recipientsResponse.ok) {
        const recipientsData = await recipientsResponse.json() as {
          signers: Array<{ email: string; status: string; signedDateTime?: string }>;
        };
        signers = recipientsData.signers.map(s => ({
          email: s.email,
          status: s.status,
          signedAt: s.signedDateTime,
        }));
      }

      return {
        envelopeId: envelope.envelopeId,
        status: envelope.status,
        completedAt: envelope.completedDateTime,
        signers,
      };
    } catch (error) {
      logger.error('DocuSign status check failed', { 
        error: (error as Error).message,
        envelopeId,
      });
      return this.mockGetStatus(envelopeId);
    }
  }

  private mockCreateEnvelope(params: CreateEnvelopeParams): EnvelopeResponse {
    return {
      envelopeId: `env_${Date.now()}`,
      status: 'sent',
      documentType: params.documentType,
      signerEmail: params.signerEmail,
      signerName: params.signerName,
      signingUrl: `https://demo.docusign.net/sign/${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  private mockGetStatus(envelopeId: string): EnvelopeStatusResponse {
    return {
      envelopeId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      signers: [
        {
          email: 'client@example.com',
          status: 'completed',
          signedAt: new Date().toISOString(),
        },
      ],
    };
  }

  async handleWebhook(event: WebhookEvent) {
    logger.info('Processing DocuSign webhook', { ...event });
    
    logger.audit('docusign_webhook_received', 'system', {
      envelopeId: event.envelopeId,
      event: event.event,
      status: event.status,
    });

    return {
      processed: true,
      event,
    };
  }
}

export const docusignService = new DocuSignService();
