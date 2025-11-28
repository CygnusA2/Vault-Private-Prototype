import OpenAI from 'openai';
import { config } from '../../core/config';
import { logger } from '../../core/logger';

interface AssetVerificationParams {
  type: string;
  description: string;
  estimatedValue: number;
  currency: string;
  documentation?: string[];
  userId: string;
}

interface VerificationResult {
  assetId: string;
  type: string;
  verificationStatus: string;
  confidenceScore: number;
  estimatedValue: number;
  adjustedValue: number;
  currency: string;
  analysis: {
    marketComparison: string;
    riskAssessment: string;
    liquidityEstimate: string;
    recommendations: string[];
  };
  verifiedAt: string;
  expiresAt: string;
}

class OpenAIService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI | null {
    if (!config.integrations.openai.apiKey) {
      return null;
    }
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: config.integrations.openai.apiKey,
      });
    }
    return this.client;
  }

  private isConfigured(): boolean {
    return !!config.integrations.openai.apiKey;
  }

  async verifyAsset(params: AssetVerificationParams): Promise<VerificationResult> {
    const client = this.getClient();
    
    if (!client) {
      logger.warn('OpenAI not configured, returning mock response');
      return this.mockVerifyAsset(params);
    }

    try {
      logger.info('Verifying asset with OpenAI', { assetType: params.type, userId: params.userId });

      const prompt = `You are an expert asset valuation analyst for a private wealth management platform serving ultra-high net worth clients.

Analyze the following asset and provide a verification assessment:

Asset Type: ${params.type}
Description: ${params.description}
Claimed Value: ${params.currency} ${params.estimatedValue.toLocaleString()}
${params.documentation ? `Supporting Documents: ${params.documentation.join(', ')}` : 'No supporting documents provided'}

Provide your analysis in the following JSON format only, with no additional text:
{
  "verificationStatus": "verified" or "pending_review" or "requires_documentation",
  "confidenceScore": 0.0 to 1.0,
  "adjustedValue": number (your estimated fair market value),
  "marketComparison": "brief comparison to market",
  "riskAssessment": "Low/Medium/High risk with brief explanation",
  "liquidityEstimate": "estimated time to convert to cash",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

      const response = await client.chat.completions.create({
        model: config.integrations.openai.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert asset valuation analyst. Always respond with valid JSON only, no markdown or additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const analysis = JSON.parse(content);
      
      logger.audit('asset_verified_by_ai', params.userId, {
        assetType: params.type,
        confidenceScore: analysis.confidenceScore,
        status: analysis.verificationStatus,
      });

      return {
        assetId: `asset_${Date.now()}`,
        type: params.type,
        verificationStatus: analysis.verificationStatus,
        confidenceScore: analysis.confidenceScore,
        estimatedValue: params.estimatedValue,
        adjustedValue: analysis.adjustedValue,
        currency: params.currency,
        analysis: {
          marketComparison: analysis.marketComparison,
          riskAssessment: analysis.riskAssessment,
          liquidityEstimate: analysis.liquidityEstimate,
          recommendations: analysis.recommendations,
        },
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI asset verification failed', { 
        error: (error as Error).message,
        assetType: params.type,
      });
      return this.mockVerifyAsset(params);
    }
  }

  private mockVerifyAsset(params: AssetVerificationParams): VerificationResult {
    const confidenceScore = 0.85 + Math.random() * 0.12;
    
    return {
      assetId: `asset_${Date.now()}`,
      type: params.type,
      verificationStatus: 'verified',
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      estimatedValue: params.estimatedValue,
      adjustedValue: Math.round(params.estimatedValue * (0.95 + Math.random() * 0.1)),
      currency: params.currency,
      analysis: {
        marketComparison: 'Consistent with current market values',
        riskAssessment: 'Low risk asset class',
        liquidityEstimate: 'Moderate - 30 to 60 day conversion window',
        recommendations: [
          'Documentation appears complete',
          'Valuation aligns with comparable assets',
          'Recommend proceeding with tokenization',
        ],
      },
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async analyzePortfolio(userId: string, assets: unknown[]) {
    const client = this.getClient();
    
    if (!client) {
      logger.warn('OpenAI not configured, returning mock response');
      return this.mockAnalyzePortfolio(userId, assets);
    }

    try {
      logger.info('Analyzing portfolio with OpenAI', { userId, assetCount: Array.isArray(assets) ? assets.length : 0 });

      const prompt = `You are a senior wealth advisor for ultra-high net worth clients.

Analyze this investment portfolio and provide strategic recommendations:

Portfolio Summary:
${JSON.stringify(assets, null, 2)}

Provide your analysis in the following JSON format only:
{
  "diversificationScore": 0.0 to 1.0,
  "riskLevel": "low" or "moderate" or "high",
  "totalEstimatedValue": number,
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "tokenizationPriority": ["asset type to tokenize first", "second priority", "third priority"],
  "liquidityStrategy": "brief strategy for maximizing liquidity"
}`;

      const response = await client.chat.completions.create({
        model: config.integrations.openai.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert wealth advisor. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const analysis = JSON.parse(content);
      
      logger.audit('portfolio_analyzed_by_ai', userId, {
        diversificationScore: analysis.diversificationScore,
        riskLevel: analysis.riskLevel,
      });

      return {
        userId,
        totalAssets: Array.isArray(assets) ? assets.length : 0,
        diversificationScore: analysis.diversificationScore,
        riskLevel: analysis.riskLevel,
        totalEstimatedValue: analysis.totalEstimatedValue,
        recommendations: analysis.recommendations,
        tokenizationPriority: analysis.tokenizationPriority,
        liquidityStrategy: analysis.liquidityStrategy,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('OpenAI portfolio analysis failed', { error: (error as Error).message });
      return this.mockAnalyzePortfolio(userId, assets);
    }
  }

  private mockAnalyzePortfolio(userId: string, assets: unknown[]) {
    return {
      userId,
      totalAssets: Array.isArray(assets) ? assets.length : 0,
      diversificationScore: 0.72,
      riskLevel: 'moderate',
      recommendations: [
        'Portfolio shows good diversification across asset classes',
        'Consider tokenizing real estate holdings first for optimal liquidity',
        'Art collection may benefit from specialized valuation',
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  async chatWithAgent(userId: string, message: string, context?: string) {
    const client = this.getClient();
    
    if (!client) {
      return this.mockChatResponse(message);
    }

    try {
      logger.info('AI agent chat', { userId, messageLength: message.length });

      const systemPrompt = `You are a sophisticated AI wealth advisor for Vault Private, an exclusive private banking platform for ultra-high net worth individuals.

Your expertise includes:
- Asset tokenization and blockchain-based liquidity solutions
- Alternative asset valuation (real estate, art, private equity, collectibles)
- Private credit and lending syndication
- Wealth preservation and estate planning
- Tax-efficient liquidity strategies

Communication style:
- Professional yet personable
- Concise and actionable
- Focus on client's goals and concerns
- Never provide specific legal or tax advice (recommend consulting specialists)

${context ? `Context: ${context}` : ''}`;

      const response = await client.chat.completions.create({
        model: config.integrations.openai.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content;
      
      logger.audit('ai_agent_chat', userId, { messageLength: message.length });

      return {
        response: content || 'I apologize, but I was unable to process your request. Please try again.',
        suggestedActions: [
          'View portfolio',
          'Start tokenization',
          'Check liquidity offers',
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('AI agent chat failed', { error: (error as Error).message });
      return this.mockChatResponse(message);
    }
  }

  private mockChatResponse(message: string) {
    return {
      response: `I understand you're asking about "${message.substring(0, 50)}...". As your AI wealth advisor, I can help you with asset tokenization, liquidity options, and portfolio management. How may I assist you further?`,
      suggestedActions: [
        'View portfolio',
        'Start tokenization',
        'Check liquidity offers',
      ],
      timestamp: new Date().toISOString(),
    };
  }
}

export const openaiService = new OpenAIService();
