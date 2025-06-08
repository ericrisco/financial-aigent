import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { config } from '../config/config';
import { SEARCH_PLANNER_PROMPT } from './prompts/search-planner.prompt';
import { ResearchState, ToolPlan } from '../interfaces/state.interface';
import { removeThinkingTags } from '../utils/text.utils';
import { PromptTemplate } from '@langchain/core/prompts';
import { OllamaHealthChecker } from '../utils/ollama-health';
import logger from '../utils/logger';

export class SearchPlannerBrain {
  private model: ChatOllama;
  private prompt: PromptTemplate;
  private healthChecker: OllamaHealthChecker;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: config.llm.ollamaBaseUrl,
      model: config.llm.thinkingModel,
      temperature: 0
    });

    this.prompt = PromptTemplate.fromTemplate(SEARCH_PLANNER_PROMPT);
    this.healthChecker = new OllamaHealthChecker();
  }

  private parseToolPlan(response: string): ToolPlan {
    try {
      let cleanResponse = removeThinkingTags(response.trim());
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to extract JSON from the response if it's mixed with text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.tools || !Array.isArray(parsed.tools) || !parsed.queries) {
        throw new Error('Invalid tool plan structure');
      }

      return {
        tools: parsed.tools,
        queries: parsed.queries
      };
    } catch (error) {
      logger.error('Failed to parse tool plan, falling back to Tavily only:', error);
      logger.info('Raw response was:', response.substring(0, 200) + '...');
      
      // Fallback to Tavily with the original query
      return {
        tools: ['TAVILY'],
        queries: {
          'TAVILY': response.trim()
        }
      };
    }
  }

  private generateFallbackPlan(query: string): ToolPlan {
    // Analyze query to determine best tools
    const lowerQuery = query.toLowerCase();
    const tools: string[] = ['TAVILY']; // Always include web search
    const queries: { [key: string]: string } = {
      'TAVILY': query
    };

    // Add financial data if query seems financial
    if (lowerQuery.includes('stock') || lowerQuery.includes('financial') || 
        lowerQuery.includes('earnings') || lowerQuery.includes('market') ||
        lowerQuery.includes('investment') || lowerQuery.includes('analysis')) {
      tools.push('YAHOO_FINANCE');
      queries['YAHOO_FINANCE'] = query;
    }

    // Add news if query seems news-related
    if (lowerQuery.includes('news') || lowerQuery.includes('recent') || 
        lowerQuery.includes('latest') || lowerQuery.includes('trends')) {
      tools.push('NEWSDATA');
      queries['NEWSDATA'] = query;
    }

    return { tools, queries };
  }

  async invoke(state: ResearchState): Promise<ResearchState> {
    // Check Ollama health first
    const healthStatus = await this.healthChecker.checkHealth();
    
    if (!healthStatus.isConnected) {
      logger.error('Ollama is not connected, using fallback search plan');
      return {
        ...state,
        searchPlan: this.generateFallbackPlan(state.researchQuery)
      };
    }

    if (!healthStatus.requiredModels.thinking.available) {
      logger.error(`Thinking model ${config.llm.thinkingModel} not available, using fallback search plan`);
      return {
        ...state,
        searchPlan: this.generateFallbackPlan(state.researchQuery)
      };
    }

    try {
      const formattedPrompt = await this.prompt.format({
        input: state.researchQuery
      });

      logger.debug('Sending prompt to thinking model...');
      const response = await this.model.invoke(formattedPrompt);
      
      if (!response || !response.content) {
        logger.warn('Empty response from model, using fallback plan');
        return {
          ...state,
          searchPlan: this.generateFallbackPlan(state.researchQuery)
        };
      }

      const searchPlan = this.parseToolPlan(response.content.toString());

      if (!searchPlan || !searchPlan.tools.length) {
        logger.warn('Invalid search plan generated, using fallback');
        return {
          ...state,
          searchPlan: this.generateFallbackPlan(state.researchQuery)
        };
      }

      logger.info(`Search plan generated: ${searchPlan.tools.join(', ')}`);

      return {
        ...state,
        searchPlan
      };
    } catch (error) {
      logger.error('Error in search planner:', error);
      logger.info('Using fallback search plan due to error');
      
      return {
        ...state,
        searchPlan: this.generateFallbackPlan(state.researchQuery)
      };
    }
  }
} 