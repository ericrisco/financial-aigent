import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { config } from '../config/config';
import { CONTENT_SUMMARIZER_PROMPT } from './prompts/content-summarizer.prompt';
import { ResearchState, SearchResult } from '../interfaces/state.interface';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { OllamaHealthChecker } from '../utils/ollama-health';
import logger from '../utils/logger';

export class ContentSummarizerBrain {
  private model: ChatOllama;
  private prompt: PromptTemplate;
  private readonly maxConcurrency = 2; // Reduced from 3 to 2 to avoid overwhelming Ollama
  private healthChecker: OllamaHealthChecker;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: config.llm.ollamaBaseUrl,
      model: config.llm.generatingModel,
      temperature: 0.1
    });

    this.prompt = PromptTemplate.fromTemplate(CONTENT_SUMMARIZER_PROMPT);
    this.healthChecker = new OllamaHealthChecker();
  }

  private async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} items)`);
      
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      
      results.push(...batchResults);
      
      // Longer delay between batches to avoid overwhelming Ollama
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms to 2s
      }
    }
    
    return results;
  }

  private generateFallbackSummary(result: SearchResult, topic: string): string {
    const baseText = result.rawContent || result.content || '';
    const words = baseText.split(' ').slice(0, 100); // First 100 words
    const truncated = words.join(' ');
    
    return `Summary for ${result.url}: ${truncated}${words.length >= 100 ? '...' : ''} (Related to: ${topic})`;
  }

  private async summarizeContent(result: SearchResult, topic: string): Promise<SearchResult> {
    try {
      logger.info(`Starting summarization for: ${result.url}`);
      
      if (!result.rawContent || result.rawContent.trim().length === 0) {
        logger.warn(`No raw content available for ${result.url}`);
        return {
          ...result,
          summary: this.generateFallbackSummary(result, topic)
        };
      }

      // Check if content is too short to summarize
      if (result.rawContent.trim().length < 50) {
        logger.info(`Content too short for ${result.url}, using as summary`);
        return {
          ...result,
          summary: `${result.rawContent} (Source: ${result.url})`
        };
      }

      const formattedPrompt = await this.prompt.format({
        topic,
        content: result.rawContent
      });

      logger.debug(`Sending prompt to model for ${result.url}`);
      
      // Add timeout and retry logic for Ollama calls
      let response: any;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await Promise.race([
            this.model.invoke(formattedPrompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Ollama timeout')), 60000) // Increased to 60 seconds
            )
          ]);
          
          // Break if we got a valid response
          if (response && response.content !== undefined) {
            break;
          }
          
          // If response is invalid, treat as error and retry
          throw new Error('Invalid response from Ollama - content is undefined');
          
        } catch (error) {
          retryCount++;
          logger.warn(`Ollama call failed for ${result.url} (attempt ${retryCount}/${maxRetries}):`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Increased base delay
        }
      }

      // Enhanced response validation
      if (!response) {
        logger.warn(`Null response from model for ${result.url} after ${maxRetries} attempts`);
        return {
          ...result,
          summary: this.generateFallbackSummary(result, topic)
        };
      }

      if (response.content === undefined || response.content === null) {
        logger.warn(`Undefined/null content in response from model for ${result.url}`);
        return {
          ...result,
          summary: this.generateFallbackSummary(result, topic)
        };
      }

      const summary = response.content.toString().trim();
      
      // Validate summary quality
      if (summary.length === 0) {
        logger.warn(`Empty summary generated for ${result.url}`);
        return {
          ...result,
          summary: this.generateFallbackSummary(result, topic)
        };
      }

      if (summary.length < 20) {
        logger.warn(`Summary too short for ${result.url}, enhancing`);
        return {
          ...result,
          summary: `${summary} (Source: ${result.url}, Topic: ${topic})`
        };
      }

      logger.info(`Successfully summarized content for: ${result.url}`);

      return {
        ...result,
        summary
      };
    } catch (error) {
      logger.error(`Error summarizing content from ${result.url}:`, error);
      return {
        ...result,
        summary: this.generateFallbackSummary(result, topic)
      };
    }
  }

  async invoke(state: ResearchState): Promise<ResearchState> {
    if (!state.searchResults || state.searchResults.length === 0) {
      throw new Error('No search results available to summarize');
    }

    // Check Ollama health
    const healthStatus = await this.healthChecker.checkHealth();
    
    if (!healthStatus.isConnected || !healthStatus.requiredModels.generating.available) {
      logger.warn('Ollama not available for summarization, using fallback summaries');
      
      const fallbackResults = state.searchResults.map(result => ({
        ...result,
        summary: this.generateFallbackSummary(result, state.researchQuery)
      }));

      return {
        ...state,
        searchResults: fallbackResults
      };
    }

    logger.info(`Starting batch summarization of ${state.searchResults.length} results with max concurrency ${this.maxConcurrency}`);

    try {
      const summarizedResults = await this.processBatch(
        state.searchResults,
        (result) => this.summarizeContent(result, state.researchQuery),
        this.maxConcurrency
      );

      logger.info('Completed summarization of all results');

      return {
        ...state,
        searchResults: summarizedResults
      };
    } catch (error) {
      logger.error('Error in batch summarization:', error);
      logger.info('Using fallback summaries due to error');
      
      const fallbackResults = state.searchResults.map(result => ({
        ...result,
        summary: this.generateFallbackSummary(result, state.researchQuery)
      }));

      return {
        ...state,
        searchResults: fallbackResults
      };
    }
  }
} 