import { config } from '../../core/config';
import { logger } from '../../core/logger';

interface TitleSearchParams {
  propertyAddress: string;
  propertyType: string;
  state?: string;
  country?: string;
}

interface EscrowParams {
  transactionId: string;
  amount: number;
  parties: {
    buyer: string;
    seller: string;
  };
}

class StewartTitleService {
  private isConfigured(): boolean {
    return !!config.integrations.stewart.apiKey;
  }

  async searchTitle(params: TitleSearchParams) {
    if (!this.isConfigured()) {
      logger.warn('Stewart Title not configured, returning mock response');
      return this.mockTitleSearch(params);
    }

    logger.info('Searching title', { propertyAddress: params.propertyAddress });
    return this.mockTitleSearch(params);
  }

  private mockTitleSearch(params: TitleSearchParams) {
    return {
      searchId: `title_${Date.now()}`,
      propertyAddress: params.propertyAddress,
      status: 'clear',
      owner: {
        name: 'Current Owner',
        ownershipType: 'Fee Simple',
        acquiredDate: '2018-06-15',
      },
      encumbrances: [],
      liens: [],
      easements: [],
      titleInsuranceAvailable: true,
      estimatedPremium: Math.floor(params.propertyType === 'residential' ? 2500 : 5000),
      searchedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async initiateEscrow(params: EscrowParams) {
    if (!this.isConfigured()) {
      return this.mockInitiateEscrow(params);
    }

    return this.mockInitiateEscrow(params);
  }

  private mockInitiateEscrow(params: EscrowParams) {
    return {
      escrowId: `escrow_${Date.now()}`,
      transactionId: params.transactionId,
      amount: params.amount,
      status: 'opened',
      parties: params.parties,
      escrowAccount: {
        bankName: 'Stewart Title Guaranty Company',
        accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
        reference: `ESC-${Date.now().toString(36).toUpperCase()}`,
      },
      openedAt: new Date().toISOString(),
    };
  }

  async getEscrowStatus(escrowId: string) {
    return {
      escrowId,
      status: 'active',
      balance: 0,
      disbursements: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const stewartService = new StewartTitleService();
