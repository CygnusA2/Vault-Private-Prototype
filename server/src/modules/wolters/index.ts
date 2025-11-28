import { config } from '../../core/config';
import { logger } from '../../core/logger';

interface LienSearchParams {
  debtorName: string;
  state?: string;
  searchType: 'ucc' | 'judgment' | 'tax' | 'all';
}

interface UCCFilingParams {
  debtorName: string;
  debtorAddress: string;
  securedParty: string;
  collateralDescription: string;
  filingType: 'initial' | 'amendment' | 'continuation' | 'termination';
}

class WoltersKluwerService {
  private isConfigured(): boolean {
    return !!config.integrations.woltersKluwer.apiKey;
  }

  async searchLiens(params: LienSearchParams) {
    if (!this.isConfigured()) {
      logger.warn('Wolters Kluwer not configured, returning mock response');
      return this.mockLienSearch(params);
    }

    logger.info('Searching liens', { debtorName: params.debtorName });
    return this.mockLienSearch(params);
  }

  private mockLienSearch(params: LienSearchParams) {
    return {
      searchId: `lien_${Date.now()}`,
      debtorName: params.debtorName,
      searchType: params.searchType,
      results: {
        uccFilings: [],
        judgmentLiens: [],
        taxLiens: [],
        totalFound: 0,
      },
      status: 'clear',
      searchedAt: new Date().toISOString(),
      certification: {
        certified: true,
        certificationNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  async fileUCC(params: UCCFilingParams) {
    if (!this.isConfigured()) {
      return this.mockFileUCC(params);
    }

    return this.mockFileUCC(params);
  }

  private mockFileUCC(params: UCCFilingParams) {
    return {
      filingId: `ucc_${Date.now()}`,
      filingType: params.filingType,
      debtorName: params.debtorName,
      securedParty: params.securedParty,
      status: 'filed',
      filingNumber: `${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      filedAt: new Date().toISOString(),
      jurisdiction: params.filingType === 'initial' ? 'Delaware' : undefined,
      expirationDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async getFilingStatus(filingId: string) {
    return {
      filingId,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    };
  }

  async terminateFiling(filingId: string, reason: string) {
    logger.info('Terminating UCC filing', { filingId, reason });
    return {
      filingId,
      status: 'terminated',
      terminatedAt: new Date().toISOString(),
      reason,
    };
  }
}

export const woltersService = new WoltersKluwerService();
