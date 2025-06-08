"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSummarizerBrain = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../config/config");
const content_summarizer_prompt_1 = require("./prompts/content-summarizer.prompt");
const prompts_1 = require("@langchain/core/prompts");
const ollama_health_1 = require("../utils/ollama-health");
const logger_1 = __importDefault(require("../utils/logger"));
class ContentSummarizerBrain {
    constructor() {
        this.maxConcurrency = 2; // Reduced from 3 to 2 to avoid overwhelming Ollama
        this.model = new ollama_1.ChatOllama({
            baseUrl: config_1.config.llm.ollamaBaseUrl,
            model: config_1.config.llm.generatingModel,
            temperature: 0.1
        });
        this.prompt = prompts_1.PromptTemplate.fromTemplate(content_summarizer_prompt_1.CONTENT_SUMMARIZER_PROMPT);
        this.healthChecker = new ollama_health_1.OllamaHealthChecker();
    }
    processBatch(items, processor, batchSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                logger_1.default.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} items)`);
                const batchResults = yield Promise.all(batch.map(item => processor(item)));
                results.push(...batchResults);
                // Longer delay between batches to avoid overwhelming Ollama
                if (i + batchSize < items.length) {
                    yield new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms to 2s
                }
            }
            return results;
        });
    }
    generateFallbackSummary(result, topic) {
        const baseText = result.rawContent || result.content || '';
        const words = baseText.split(' ').slice(0, 100); // First 100 words
        const truncated = words.join(' ');
        return `Summary for ${result.url}: ${truncated}${words.length >= 100 ? '...' : ''} (Related to: ${topic})`;
    }
    summarizeContent(result, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Starting summarization for: ${result.url}`);
                if (!result.rawContent || result.rawContent.trim().length === 0) {
                    logger_1.default.warn(`No raw content available for ${result.url}`);
                    return Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, topic) });
                }
                // Check if content is too short to summarize
                if (result.rawContent.trim().length < 50) {
                    logger_1.default.info(`Content too short for ${result.url}, using as summary`);
                    return Object.assign(Object.assign({}, result), { summary: `${result.rawContent} (Source: ${result.url})` });
                }
                const formattedPrompt = yield this.prompt.format({
                    topic,
                    content: result.rawContent
                });
                logger_1.default.debug(`Sending prompt to model for ${result.url}`);
                // Add timeout and retry logic for Ollama calls
                let response;
                let retryCount = 0;
                const maxRetries = 3;
                while (retryCount < maxRetries) {
                    try {
                        response = yield Promise.race([
                            this.model.invoke(formattedPrompt),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Ollama timeout')), 60000) // Increased to 60 seconds
                            )
                        ]);
                        // Break if we got a valid response
                        if (response && response.content !== undefined) {
                            break;
                        }
                        // If response is invalid, treat as error and retry
                        throw new Error('Invalid response from Ollama - content is undefined');
                    }
                    catch (error) {
                        retryCount++;
                        logger_1.default.warn(`Ollama call failed for ${result.url} (attempt ${retryCount}/${maxRetries}):`, error);
                        if (retryCount >= maxRetries) {
                            throw error;
                        }
                        // Wait before retry with exponential backoff
                        yield new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Increased base delay
                    }
                }
                // Enhanced response validation
                if (!response) {
                    logger_1.default.warn(`Null response from model for ${result.url} after ${maxRetries} attempts`);
                    return Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, topic) });
                }
                if (response.content === undefined || response.content === null) {
                    logger_1.default.warn(`Undefined/null content in response from model for ${result.url}`);
                    return Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, topic) });
                }
                const summary = response.content.toString().trim();
                // Validate summary quality
                if (summary.length === 0) {
                    logger_1.default.warn(`Empty summary generated for ${result.url}`);
                    return Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, topic) });
                }
                if (summary.length < 20) {
                    logger_1.default.warn(`Summary too short for ${result.url}, enhancing`);
                    return Object.assign(Object.assign({}, result), { summary: `${summary} (Source: ${result.url}, Topic: ${topic})` });
                }
                logger_1.default.info(`Successfully summarized content for: ${result.url}`);
                return Object.assign(Object.assign({}, result), { summary });
            }
            catch (error) {
                logger_1.default.error(`Error summarizing content from ${result.url}:`, error);
                return Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, topic) });
            }
        });
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchResults || state.searchResults.length === 0) {
                throw new Error('No search results available to summarize');
            }
            // Check Ollama health
            const healthStatus = yield this.healthChecker.checkHealth();
            if (!healthStatus.isConnected || !healthStatus.requiredModels.generating.available) {
                logger_1.default.warn('Ollama not available for summarization, using fallback summaries');
                const fallbackResults = state.searchResults.map(result => (Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, state.researchQuery) })));
                return Object.assign(Object.assign({}, state), { searchResults: fallbackResults });
            }
            logger_1.default.info(`Starting batch summarization of ${state.searchResults.length} results with max concurrency ${this.maxConcurrency}`);
            try {
                const summarizedResults = yield this.processBatch(state.searchResults, (result) => this.summarizeContent(result, state.researchQuery), this.maxConcurrency);
                logger_1.default.info('Completed summarization of all results');
                return Object.assign(Object.assign({}, state), { searchResults: summarizedResults });
            }
            catch (error) {
                logger_1.default.error('Error in batch summarization:', error);
                logger_1.default.info('Using fallback summaries due to error');
                const fallbackResults = state.searchResults.map(result => (Object.assign(Object.assign({}, result), { summary: this.generateFallbackSummary(result, state.researchQuery) })));
                return Object.assign(Object.assign({}, state), { searchResults: fallbackResults });
            }
        });
    }
}
exports.ContentSummarizerBrain = ContentSummarizerBrain;
