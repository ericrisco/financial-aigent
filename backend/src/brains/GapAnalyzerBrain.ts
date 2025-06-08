import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { config } from '../config/config';
import { GAP_ANALYZER_PROMPT } from './prompts/gap-analyzer.prompt';
import { ResearchState, ToolPlan } from '../interfaces/state.interface';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { removeThinkingTags } from '../utils/text.utils';
import { OllamaHealthChecker } from '../utils/ollama-health';
import logger from '../utils/logger';

export class GapAnalyzerBrain {
  private model: ChatOllama;
  private prompt: PromptTemplate;
  private healthChecker: OllamaHealthChecker;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: config.llm.ollamaBaseUrl,
      model: config.llm.thinkingModel,
      temperature: 0
    });

    this.prompt = PromptTemplate.fromTemplate(GAP_ANALYZER_PROMPT);
    this.healthChecker = new OllamaHealthChecker();
  }

  private parseGapAnalysis(response: string): ToolPlan | 'NONE' {
    try {
      let cleanResponse = removeThinkingTags(response.trim());
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Enhanced NONE detection - check for various ways the model might indicate no gaps
      if (cleanResponse === 'NONE' || cleanResponse === '"NONE"' || 
          cleanResponse.toLowerCase().includes('no significant gaps') ||
          cleanResponse.toLowerCase().includes('no knowledge gaps') ||
          cleanResponse.toLowerCase().includes('complete coverage') ||
          cleanResponse.toLowerCase().includes('sufficient information') ||
          cleanResponse.toLowerCase().includes('comprehensive coverage') ||
          cleanResponse.toLowerCase().includes('no additional') ||
          cleanResponse.toLowerCase().includes('adequate information') ||
          cleanResponse.toLowerCase().includes('meets institutional standards') ||
          cleanResponse.toLowerCase().includes('no gaps') ||
          cleanResponse.toLowerCase().includes('analysis is complete')) {
        return 'NONE';
      }

      // Try to extract JSON from the response if it's mixed with text
      let jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      } else {
        // If no JSON found, check if it's a descriptive response indicating no gaps
        if (cleanResponse.toLowerCase().includes('analysis') && 
            (cleanResponse.toLowerCase().includes('complete') || 
             cleanResponse.toLowerCase().includes('sufficient') ||
             cleanResponse.toLowerCase().includes('comprehensive'))) {
          logger.info('Model provided descriptive response indicating analysis is complete');
          return 'NONE';
        }
        
        // If response doesn't contain JSON and doesn't indicate completion, return NONE
        logger.warn('No JSON found in response and no completion indicators, returning NONE');
        logger.info('Response preview:', cleanResponse.substring(0, 100) + '...');
        return 'NONE';
      }

      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.tools || !Array.isArray(parsed.tools) || !parsed.queries) {
        logger.warn('Invalid gap analysis structure, returning NONE');
        return 'NONE';
      }

      // Validate that tools and queries are meaningful
      if (parsed.tools.length === 0 || Object.keys(parsed.queries).length === 0) {
        logger.warn('Empty tools or queries, returning NONE');
        return 'NONE';
      }

      return {
        tools: parsed.tools,
        queries: parsed.queries
      };
    } catch (error) {
      logger.warn('Failed to parse gap analysis JSON, treating as NONE:', error instanceof Error ? error.message : String(error));
      logger.info('Raw response preview:', response.substring(0, 200) + '...');
      return 'NONE';
    }
  }

  private concatenateSummaries(state: ResearchState): string {
    if (!state.searchResults) return '';

    return state.searchResults
      .map((result, index) => {
        if (!result.summary) return '';
        return `Source ${index + 1}:\n${result.summary}\n`;
      })
      .join('\n');
  }

  private assessInformationCompleteness(state: ResearchState): boolean {
    // SUPER PRO analysis requires much higher standards - be more demanding
    const summaries = this.concatenateSummaries(state);
    const currentLoops = state.findGapLoops || 0;
    
    // Only skip gap analysis if we've already done 2+ loops (instead of 1)
    if (currentLoops >= 2) {
      logger.info('Completed multiple gap analysis rounds, considering sufficient for SUPER PRO standards');
      return true;
    }

    // Require much more substantial information for SUPER PRO reports
    if (summaries.length < 3000) { // Increased from 1000 to 3000
      logger.info('Insufficient information depth for SUPER PRO analysis, continuing gap search');
      return false;
    }

    // Require more sources for comprehensive coverage
    if (!state.searchResults || state.searchResults.length < 5) { // Increased from 3 to 5
      logger.info('Insufficient source diversity for SUPER PRO analysis, continuing gap search');
      return false;
    }

    // Check for financial data presence (critical for SUPER PRO)
    if (!state.financialData || state.financialData.length === 0) {
      logger.info('Missing financial data for SUPER PRO analysis, continuing gap search');
      return false;
    }

    // Check for news data presence (critical for current market context)
    if (!state.newsData || state.newsData.length === 0) {
      logger.info('Missing news data for SUPER PRO analysis, continuing gap search');
      return false;
    }

    // For first loop, be more demanding about content quality
    if (currentLoops === 0) {
      // Check if we have diverse content types
      const hasFinancialContent = summaries.toLowerCase().includes('financial') || 
                                 summaries.toLowerCase().includes('earnings') ||
                                 summaries.toLowerCase().includes('revenue');
      const hasMarketContent = summaries.toLowerCase().includes('market') || 
                              summaries.toLowerCase().includes('competitive') ||
                              summaries.toLowerCase().includes('industry');
      const hasRecentContent = summaries.toLowerCase().includes('2024') || 
                              summaries.toLowerCase().includes('recent') ||
                              summaries.toLowerCase().includes('latest');

      if (!hasFinancialContent || !hasMarketContent || !hasRecentContent) {
        logger.info('Missing critical content dimensions for SUPER PRO analysis, continuing gap search');
        return false;
      }
    }

    logger.info('Information meets SUPER PRO standards, proceeding to document generation');
    return true;
  }

  async invoke(state: ResearchState): Promise<ResearchState> {
    if (!state.searchResults || state.searchResults.length === 0) {
      logger.warn('No search results available, returning NONE for gap analysis');
      return {
        ...state,
        gapQuery: 'NONE'
      };
    }

    const summaries = this.concatenateSummaries(state);
    
    if (!summaries) {
      logger.warn('No summaries available, returning NONE for gap analysis');
      return {
        ...state,
        gapQuery: 'NONE'
      };
    }

    // Conservative assessment first
    if (this.assessInformationCompleteness(state)) {
      logger.info('Information appears complete, skipping gap analysis');
      return {
        ...state,
        gapQuery: 'NONE'
      };
    }

    // Check Ollama health
    const healthStatus = await this.healthChecker.checkHealth();
    
    if (!healthStatus.isConnected || !healthStatus.requiredModels.thinking.available) {
      logger.warn('Ollama not available for gap analysis, returning NONE');
      return {
        ...state,
        gapQuery: 'NONE'
      };
    }

    try {
      logger.info('Analyzing knowledge gaps...');

      const formattedPrompt = await this.prompt.format({
        topic: state.researchQuery,
        summaries
      });

      const response = await this.model.invoke(formattedPrompt);
      
      if (!response || !response.content) {
        logger.warn('Empty response from model, returning NONE');
        return {
          ...state,
          gapQuery: 'NONE'
        };
      }

      const gapQuery = this.parseGapAnalysis(response.content.toString());

      if (gapQuery === 'NONE') {
        logger.info('No knowledge gaps found');
      } else {
        logger.info(`Found knowledge gaps, tools needed: ${gapQuery.tools.join(', ')}`);
      }

      return {
        ...state,
        gapQuery
      };
    } catch (error) {
      logger.error('Error in gap analysis:', error);
      logger.info('Returning NONE due to error');
      return {
        ...state,
        gapQuery: 'NONE'
      };
    }
  }
} 