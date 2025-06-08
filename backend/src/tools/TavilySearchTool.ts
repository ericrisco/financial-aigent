import { tavily } from '@tavily/core';
import { config } from '../config/config';
import { ResearchState, SearchResult } from '../interfaces/state.interface';
import { TavilyResponse, TavilyResult } from '../interfaces/tavily.interface';
import logger from '../utils/logger';

export class TavilySearchTool {
  private client: ReturnType<typeof tavily>;
  private retryCount: number = 0;

  constructor() {
    this.client = tavily({ apiKey: config.tavily.apiKey });
  }

  private async searchWithRetry(
    query: string, 
    maxResults: number
  ): Promise<SearchResult[]> {
    try {
      const response = await this.client.search(query, {
        searchDepth: 'advanced',
        maxResults,
        includeRawContent: true
      }) as TavilyResponse;

      if (!response.results || response.results.length === 0) {
        this.retryCount++;
        
        if (this.retryCount >= config.tavily.maxRetries) {
          throw new Error(`No results found after ${config.tavily.maxRetries} attempts`);
        }

        logger.info(`No results found, retrying with ${maxResults * 2} results...`);
        return this.searchWithRetry(query, maxResults * 2);
      }

      return response.results.map((result: TavilyResult) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        rawContent: result.rawContent || '',
        score: result.score
      }));

    } catch (error) {
      if (error instanceof Error && error.message.includes('No results found')) {
        throw error;
      }
      
      logger.error('Error searching with Tavily:', error);
      throw new Error('Failed to perform search');
    }
  }

  async invoke(state: ResearchState): Promise<ResearchState> {
    if (!state.searchPlan) {
      throw new Error('No search plan available');
    }

    // Handle both old string format and new ToolPlan format for backward compatibility
    let query: string;
    if (typeof state.searchPlan === 'string') {
      query = state.searchPlan;
    } else {
      query = state.searchPlan.queries['TAVILY'] || Object.values(state.searchPlan.queries)[0] || '';
    }

    if (!query) {
      throw new Error('No query available for Tavily search');
    }

    this.retryCount = 0;
    const results = await this.searchWithRetry(
      query,
      config.tavily.initialResults
    );

    return {
      ...state,
      searchResults: results
    };
  }
} 