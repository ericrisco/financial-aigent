import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config/config';
import { ResearchState } from '../interfaces/state.interface';
import { 
  NewsDataArticle, 
  NewsDataResponse, 
  NewsDataSearchParams,
  NewsData 
} from '../interfaces/newsdata.interface';
import logger from '../utils/logger';

export class NewsDataTool {
  private client: AxiosInstance;
  private retryCount: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: config.newsData.baseUrl,
      timeout: config.newsData.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Financial-Agent/1.0'
      }
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      const result = await operation();
      this.retryCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.retryCount++;
      
      if (this.retryCount >= config.newsData.maxRetries) {
        logger.error(`${context} failed after ${config.newsData.maxRetries} attempts:`, error);
        throw new Error(`${context} failed after maximum retries`);
      }

      const delay = config.newsData.retryDelay * this.retryCount;
      logger.warn(`${context} failed, retrying in ${delay}ms (attempt ${this.retryCount}/${config.newsData.maxRetries})`);
      
      await this.delay(delay);
      return this.executeWithRetry(operation, context);
    }
  }

  private buildSearchParams(query: string): NewsDataSearchParams {
    const params: NewsDataSearchParams = {
      apikey: config.newsData.apiKey,
      language: config.newsData.defaultLanguage,
      size: config.newsData.defaultSize
    };

    // Extract keywords and build search parameters
    const keywords = this.extractKeywords(query);
    if (keywords.length > 0) {
      // Limit query length to under 100 characters for NewsData API
      let searchQuery = keywords.join(' OR ');
      if (searchQuery.length > 95) {
        // Take only the first few keywords to stay under limit
        const limitedKeywords = [];
        let currentLength = 0;
        for (const keyword of keywords) {
          const nextLength = currentLength + keyword.length + (limitedKeywords.length > 0 ? 4 : 0); // +4 for " OR "
          if (nextLength > 95) break;
          limitedKeywords.push(keyword);
          currentLength = nextLength;
        }
        searchQuery = limitedKeywords.join(' OR ');
      }
      params.q = searchQuery;
    }

    // Check for specific categories in the query
    const category = this.detectCategory(query);
    if (category) {
      params.category = category;
    }

    // Check for country-specific queries
    const country = this.detectCountry(query);
    if (country) {
      params.country = country;
    }

    // Check for time-sensitive queries
    const timeRange = this.detectTimeRange(query);
    if (timeRange) {
      params.from_date = timeRange.from;
      params.to_date = timeRange.to;
    }

    return params;
  }

  private extractKeywords(query: string): string[] {
    // Remove common stop words and extract meaningful keywords
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'news', 'latest', 'recent'];
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  private detectCategory(query: string): string | undefined {
    const categoryMap: { [key: string]: string } = {
      'business': 'business',
      'technology': 'technology',
      'tech': 'technology',
      'sports': 'sports',
      'entertainment': 'entertainment',
      'health': 'health',
      'science': 'science',
      'politics': 'politics',
      'world': 'world',
      'environment': 'environment',
      'food': 'food',
      'tourism': 'tourism'
    };

    const lowerQuery = query.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerQuery.includes(keyword)) {
        return category;
      }
    }

    return undefined;
  }

  private detectCountry(query: string): string | undefined {
    const countryMap: { [key: string]: string } = {
      'usa': 'us',
      'united states': 'us',
      'america': 'us',
      'uk': 'gb',
      'britain': 'gb',
      'england': 'gb',
      'canada': 'ca',
      'australia': 'au',
      'germany': 'de',
      'france': 'fr',
      'japan': 'jp',
      'china': 'cn',
      'india': 'in',
      'brazil': 'br',
      'russia': 'ru',
      'spain': 'es',
      'italy': 'it'
    };

    const lowerQuery = query.toLowerCase();
    for (const [keyword, countryCode] of Object.entries(countryMap)) {
      if (lowerQuery.includes(keyword)) {
        return countryCode;
      }
    }

    return undefined;
  }

  private detectTimeRange(query: string): { from: string; to: string } | undefined {
    const today = new Date();
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('today')) {
      const todayStr = today.toISOString().split('T')[0];
      return { from: todayStr, to: todayStr };
    }

    if (lowerQuery.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return { from: yesterdayStr, to: yesterdayStr };
    }

    if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { 
        from: weekAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    }

    if (lowerQuery.includes('last month') || lowerQuery.includes('past month')) {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { 
        from: monthAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      };
    }

    return undefined;
  }

  private async fetchNews(endpoint: string, params: NewsDataSearchParams): Promise<NewsDataResponse> {
    return this.executeWithRetry(async () => {
      const response: AxiosResponse<NewsDataResponse> = await this.client.get(`/${endpoint}`, {
        params: params as any
      });

      if (response.data.status !== 'success') {
        throw new Error(`NewsData API error: ${response.data.status}`);
      }

      return response.data;
    }, `Fetch news from ${endpoint}`);
  }

  private generateNewsSummary(newsData: NewsData): string {
    const { articles, totalResults } = newsData;
    
    if (!articles || articles.length === 0) {
      return 'No news articles found for the given query.';
    }

    let summary = `Found ${totalResults} news articles. Here are the top ${articles.length} results:\n\n`;

    articles.slice(0, 5).forEach((article, index) => {
      summary += `${index + 1}. ${article.title}\n`;
      summary += `   Source: ${article.source_id}\n`;
      summary += `   Published: ${new Date(article.pubDate).toLocaleDateString()}\n`;
      if (article.description) {
        summary += `   Summary: ${article.description.substring(0, 150)}${article.description.length > 150 ? '...' : ''}\n`;
      }
      if (article.category && article.category.length > 0) {
        summary += `   Categories: ${article.category.join(', ')}\n`;
      }
      summary += `   URL: ${article.link}\n\n`;
    });

    if (articles.length > 5) {
      summary += `... and ${articles.length - 5} more articles.\n`;
    }

    // Add category breakdown
    const categories = articles.reduce((acc, article) => {
      article.category?.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {} as { [key: string]: number });

    if (Object.keys(categories).length > 0) {
      summary += `\nCategory breakdown:\n`;
      Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([category, count]) => {
          summary += `- ${category}: ${count} articles\n`;
        });
    }

    return summary;
  }

  async invoke(state: ResearchState): Promise<ResearchState> {
    if (!state.searchPlan) {
      throw new Error('No search plan available for news data retrieval');
    }

    // Handle both old string format and new ToolPlan format for backward compatibility
    let query: string;
    if (typeof state.searchPlan === 'string') {
      query = state.searchPlan;
    } else {
      query = state.searchPlan.queries['NEWSDATA'] || Object.values(state.searchPlan.queries)[0] || '';
    }

    if (!query) {
      throw new Error('No query available for NewsData search');
    }

    if (!config.newsData.apiKey) {
      throw new Error('NewsData API key not configured');
    }

    this.retryCount = 0;
    const newsDataResults: NewsData[] = [];

    try {
      logger.info('Starting news data retrieval with NewsData.io');

      // Build search parameters from the query
      const searchParams = this.buildSearchParams(query);
      
      // Determine the best endpoint based on the query
      const endpoint = this.detectTimeRange(query) ? 'archive' : config.newsData.defaultEndpoint;
      
      logger.info(`Using endpoint: ${endpoint} with params:`, searchParams);

      // Fetch news data
      const response = await this.fetchNews(endpoint, searchParams);

      if (response.results && response.results.length > 0) {
        const newsData: NewsData = {
          articles: response.results,
          totalResults: response.totalResults,
          nextPage: response.nextPage,
          searchParams
        };

        newsData.summary = this.generateNewsSummary(newsData);
        newsDataResults.push(newsData);

        logger.info(`Successfully retrieved ${response.results.length} news articles`);
      } else {
        logger.warn('No news articles found for the given query');
      }

    } catch (error) {
      logger.error('Error in NewsData tool:', error);
      
      // Check if it's an API key error
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logger.warn('Invalid NewsData API key, returning empty results');
        return {
          ...state,
          newsData: []
        };
      }
      
      // Check if it's a rate limit error
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        logger.warn('NewsData API rate limit exceeded, returning empty results');
        return {
          ...state,
          newsData: []
        };
      }
      
      // For other errors, return empty results instead of throwing
      logger.warn('NewsData API error, returning empty results:', error instanceof Error ? error.message : String(error));
      return {
        ...state,
        newsData: []
      };
    }

    return {
      ...state,
      newsData: newsDataResults
    };
  }
} 