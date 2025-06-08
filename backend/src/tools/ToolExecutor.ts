import { ResearchState, ToolPlan, SearchResult } from '../interfaces/state.interface';
import { TavilySearchTool } from './TavilySearchTool';
import { YahooFinanceTool } from './YahooFinanceTool';
import { NewsDataTool } from './NewsDataTool';
import logger from '../utils/logger';

export class ToolExecutor {
  private tavilyTool: TavilySearchTool;
  private yahooFinanceTool: YahooFinanceTool;
  private newsDataTool: NewsDataTool;

  constructor() {
    this.tavilyTool = new TavilySearchTool();
    this.yahooFinanceTool = new YahooFinanceTool();
    this.newsDataTool = new NewsDataTool();
  }

  private async executeTavily(query: string, state: ResearchState): Promise<Partial<ResearchState>> {
    logger.info(`Executing Tavily search: ${query}`);
    const tempState = { ...state, searchPlan: { tools: ['TAVILY'], queries: { TAVILY: query } } };
    const result = await this.tavilyTool.invoke(tempState);
    return { searchResults: result.searchResults };
  }

  private async executeYahooFinance(query: string, state: ResearchState): Promise<Partial<ResearchState>> {
    logger.info(`Executing Yahoo Finance search: ${query}`);
    const tempState = { ...state, searchPlan: { tools: ['YAHOO_FINANCE'], queries: { YAHOO_FINANCE: query } } };
    const result = await this.yahooFinanceTool.invoke(tempState);
    return { financialData: result.financialData };
  }

  private async executeNewsData(query: string, state: ResearchState): Promise<Partial<ResearchState>> {
    logger.info(`Executing NewsData search: ${query}`);
    const tempState = { ...state, searchPlan: { tools: ['NEWSDATA'], queries: { NEWSDATA: query } } };
    const result = await this.newsDataTool.invoke(tempState);
    return { newsData: result.newsData };
  }

  private convertFinancialDataToSearchResults(financialData: any[]): SearchResult[] {
    if (!financialData || financialData.length === 0) return [];

    return financialData.map((data, index) => ({
      title: `${data.quote?.longName || data.quote?.shortName || data.symbol} Financial Data`,
      url: `https://finance.yahoo.com/quote/${data.symbol}`,
      content: data.summary || `Financial data for ${data.symbol}`,
      rawContent: data.summary || `Financial data for ${data.symbol}`,
      score: 0.9,
      summary: data.summary
    }));
  }

  private convertNewsDataToSearchResults(newsData: any[]): SearchResult[] {
    if (!newsData || newsData.length === 0) return [];

    const results: SearchResult[] = [];
    
    newsData.forEach(data => {
      if (data.articles && data.articles.length > 0) {
        data.articles.slice(0, 5).forEach((article: any) => {
          results.push({
            title: article.title,
            url: article.link,
            content: article.description || article.title,
            rawContent: article.description || article.title,
            score: 0.8,
            summary: article.description
          });
        });
      }
    });

    return results;
  }

  async executeToolPlan(toolPlan: ToolPlan, state: ResearchState): Promise<ResearchState> {
    const results: Partial<ResearchState>[] = [];
    const allSearchResults: SearchResult[] = [];

    // Execute all tools in parallel
    const toolPromises = toolPlan.tools.map(async (tool) => {
      const query = toolPlan.queries[tool];
      if (!query) {
        logger.warn(`No query found for tool: ${tool}`);
        return {};
      }

      try {
        switch (tool) {
          case 'TAVILY':
            return await this.executeTavily(query, state);
          case 'YAHOO_FINANCE':
            return await this.executeYahooFinance(query, state);
          case 'NEWSDATA':
            return await this.executeNewsData(query, state);
          default:
            logger.warn(`Unknown tool: ${tool}`);
            return {};
        }
      } catch (error) {
        logger.error(`Error executing tool ${tool}:`, error);
        return {};
      }
    });

    const toolResults = await Promise.all(toolPromises);

    // Combine all results
    let combinedFinancialData = state.financialData || [];
    let combinedNewsData = state.newsData || [];

    toolResults.forEach(result => {
      if (result.searchResults) {
        allSearchResults.push(...result.searchResults);
      }
      if (result.financialData) {
        combinedFinancialData = [...combinedFinancialData, ...result.financialData];
        // Convert financial data to search results for unified processing
        allSearchResults.push(...this.convertFinancialDataToSearchResults(result.financialData));
      }
      if (result.newsData) {
        combinedNewsData = [...combinedNewsData, ...result.newsData];
        // Convert news data to search results for unified processing
        allSearchResults.push(...this.convertNewsDataToSearchResults(result.newsData));
      }
    });

    logger.info(`Tool execution completed. Total results: ${allSearchResults.length}`);

    return {
      ...state,
      searchResults: allSearchResults,
      financialData: combinedFinancialData,
      newsData: combinedNewsData
    };
  }
} 